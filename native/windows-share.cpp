#define WIN32_LEAN_AND_MEAN
#include <windows.h>
#include <shellapi.h>
#include <shobjidl.h>
#include <winrt/base.h>
#include <winrt/Windows.Foundation.h>
#include <winrt/Windows.Foundation.Collections.h>
#include <winrt/Windows.Foundation.Metadata.h>
#include <winrt/Windows.ApplicationModel.DataTransfer.h>
#include <winrt/Windows.Storage.h>
#include <winrt/Windows.Data.Json.h>
#include <fstream>
#include <filesystem>
#include <string>

using namespace winrt;
using namespace Windows::ApplicationModel::DataTransfer;
using namespace Windows::Storage;
using namespace Windows::Data::Json;
using Windows::Foundation::Metadata::ApiInformation;

static HWND parentWindow;
static bool targetChosen = false;
static ULONGLONG shownAt = 0;
static void report(wchar_t const* event, hstring const& message = L"") {
    JsonObject value;
    value.Insert(L"event", JsonValue::CreateStringValue(event));
    if (!message.empty()) value.Insert(L"message", JsonValue::CreateStringValue(message));
    auto line = to_string(value.Stringify()) + "\n";
    DWORD written;
    WriteFile(GetStdHandle(STD_OUTPUT_HANDLE), line.data(), static_cast<DWORD>(line.size()), &written, nullptr);
}

static fire_and_forget provide(DataRequest request, HWND window, hstring title, hstring text, hstring file) {
    auto deferral = request.GetDeferral();
    try {
        auto data = request.Data();
        data.Properties().Title(title);
        data.Properties().Description(L"Markdown");
        data.RequestedOperation(DataPackageOperation::Copy);
        data.SetText(text);
        auto storageFile = co_await StorageFile::GetFileFromPathAsync(file);
        data.SetStorageItems(single_threaded_vector<IStorageItem>({storageFile}), true);
        data.ShareCompleted([window](auto const&, auto const&) {
            report(L"completed");
            PostMessageW(window, WM_CLOSE, 0, 0);
        });
        if (ApiInformation::IsEventPresent(L"Windows.ApplicationModel.DataTransfer.DataPackage", L"ShareCanceled")) {
            data.ShareCanceled([window](auto const&, auto const&) {
                report(L"canceled");
                PostMessageW(window, WM_CLOSE, 0, 0);
            });
        }
    } catch (hresult_error const& error) {
        request.FailWithDisplayText(L"Unable to prepare this document for sharing.");
        report(L"error", error.message());
        PostMessageW(window, WM_CLOSE, 0, 0);
    } catch (...) {
        request.FailWithDisplayText(L"Unable to prepare this document for sharing.");
        report(L"error", L"Unable to prepare the document.");
        PostMessageW(window, WM_CLOSE, 0, 0);
    }
    try { deferral.Complete(); } catch (...) {}
}

static LRESULT CALLBACK windowProcedure(HWND window, UINT message, WPARAM wParam, LPARAM lParam) {
    // Closing the sheet before choosing a target does not always raise
    // ShareCanceled. Returning focus to Lecat also ends that picker session.
    if (message == WM_TIMER && wParam == 1 && !targetChosen && shownAt &&
        GetTickCount64()-shownAt > 1000 && GetForegroundWindow() == parentWindow) {
        report(L"canceled"); DestroyWindow(window); return 0;
    }
    if (message == WM_TIMER && (wParam == 2 || !IsWindow(parentWindow))) {
        DestroyWindow(window);
        return 0;
    }
    if (message == WM_CLOSE) { DestroyWindow(window); return 0; }
    if (message == WM_DESTROY) { PostQuitMessage(0); return 0; }
    return DefWindowProcW(window, message, wParam, lParam);
}

int WINAPI wWinMain(HINSTANCE instance, HINSTANCE, PWSTR, int) {
    try {
        init_apartment(apartment_type::single_threaded);
        int count = 0;
        auto args = CommandLineToArgvW(GetCommandLineW(), &count);
        if (!args || count != 3) throw hresult_invalid_argument(L"Invalid share request.");
        parentWindow = reinterpret_cast<HWND>(std::stoull(args[1], nullptr, 16));
        std::filesystem::path payloadPath(args[2]);
        LocalFree(args);
        if (!IsWindow(parentWindow) || !payloadPath.is_absolute() || std::filesystem::file_size(payloadPath) > 64*1024*1024)
            throw hresult_invalid_argument(L"Invalid share request.");
        std::ifstream input(payloadPath, std::ios::binary);
        std::string bytes((std::istreambuf_iterator<char>(input)), std::istreambuf_iterator<char>());
        auto payload = JsonObject::Parse(to_hstring(bytes));
        auto title = payload.GetNamedString(L"title"), text = payload.GetNamedString(L"text"), file = payload.GetNamedString(L"file");
        if (title.empty() || !std::filesystem::path(file.c_str()).is_absolute()) throw hresult_invalid_argument(L"Invalid share file.");
        if (!DataTransferManager::IsSupported()) throw hresult_error(E_NOTIMPL, L"Windows sharing is unavailable in this session.");
        SetCurrentProcessExplicitAppUserModelID(L"com.lecat.markdown");
        WNDCLASSW windowClass{};
        windowClass.lpfnWndProc = windowProcedure;
        windowClass.hInstance = instance;
        windowClass.lpszClassName = L"LecatShareHost";
        if (!RegisterClassW(&windowClass)) throw_last_error();
        RECT rect{}; GetWindowRect(parentWindow, &rect);
        // WinRT sharing owns a window in its source process. An invisible owned
        // host keeps the Share sheet associated with Lecat without another app UI.
        auto window = CreateWindowExW(WS_EX_TOOLWINDOW | WS_EX_LAYERED, windowClass.lpszClassName,
            L"Lecat - Markdown", WS_POPUP, rect.left+(rect.right-rect.left)/2, rect.top+40,
            1, 1, parentWindow, nullptr, instance, nullptr);
        if (!window) throw_last_error();
        SetLayeredWindowAttributes(window, 0, 0, LWA_ALPHA);
        ShowWindow(window, SW_SHOW);
        SetForegroundWindow(window);
        auto interop = get_activation_factory<DataTransferManager, IDataTransferManagerInterop>();
        DataTransferManager manager{nullptr};
        check_hresult(interop->GetForWindow(window, guid_of<DataTransferManager>(), put_abi(manager)));
        auto token = manager.DataRequested([window,title,text,file](auto const&, DataRequestedEventArgs const& args) {
            provide(args.Request(), window, title, text, file);
        });
        auto chosenToken = manager.TargetApplicationChosen([](auto const&, auto const&) { targetChosen = true; });
        SetTimer(window, 1, 200, nullptr);
        SetTimer(window, 2, 10*60*1000, nullptr);
        check_hresult(interop->ShowShareUIForWindow(window));
        shownAt = GetTickCount64();
        report(L"ready");
        MSG message;
        while (GetMessageW(&message, nullptr, 0, 0) > 0) { TranslateMessage(&message); DispatchMessageW(&message); }
        manager.DataRequested(token);
        manager.TargetApplicationChosen(chosenToken);
        uninit_apartment();
        return 0;
    } catch (hresult_error const& error) {
        report(L"error", error.message());
    } catch (std::exception const& error) {
        report(L"error", to_hstring(error.what()));
    } catch (...) {
        report(L"error", L"Windows sharing could not be opened.");
    }
    return 1;
}
