using System.Runtime.InteropServices;
namespace ClaroMD;
static class WindowsPlaces
{
    [DllImport("shell32.dll")] static extern int SHGetKnownFolderPath(ref Guid id, uint flags, IntPtr token, out IntPtr path);
    public static string Known(string id, string fallback="")
    {
        var guid=new Guid(id);
        if(SHGetKnownFolderPath(ref guid,0,IntPtr.Zero,out var ptr)!=0)return fallback;
        try{return Marshal.PtrToStringUni(ptr)??fallback;}finally{Marshal.FreeCoTaskMem(ptr);}
    }
    public static IEnumerable<(string Label,string Path,string Icon)> Standard()
    {
        yield return ("Escritorio",Known("B4BFCC3A-DB2C-424C-B029-7FE99A87C641"),"desktop");
        yield return ("Descargas",Known("374DE290-123F-4565-9164-39C4925E467B"),"download");
        yield return ("Documentos",Known("FDD39AD0-238F-46AF-ADB4-6C85480369C7"),"document");
        yield return ("Imágenes",Known("33E28130-4E1E-4676-835A-98395C3BC3BB"),"image");
        yield return ("Música",Known("4BD8D571-6D19-48D3-BE97-422220080E43"),"music");
        yield return ("Vídeos",Known("18989B1D-99B5-455B-841C-AB7C74E4DDFC"),"video");
    }
    public static Task<List<(string Label,string Path)>> QuickAccess()
    {
        var result=new TaskCompletionSource<List<(string,string)>>();
        var thread=new Thread(()=>{
            object? shell=null,ns=null,items=null;
            var places=new List<(string,string)>();
            try {
                shell=Activator.CreateInstance(Type.GetTypeFromProgID("Shell.Application")!);
                ns=((dynamic)shell!).NameSpace("shell:::{679f85cb-0220-4080-b29b-5540cc05aab6}");
                if(ns!=null){items=((dynamic)ns).Items();foreach(var item in (dynamic)items){try{string path=item.Path;if(item.IsFolder && Path.IsPathFullyQualified(path) && Directory.Exists(path))places.Add((item.Name,path));}catch{}finally{if(Marshal.IsComObject(item))Marshal.FinalReleaseComObject(item);}}}
            }catch{}finally{if(items!=null&&Marshal.IsComObject(items))Marshal.FinalReleaseComObject(items);if(ns!=null&&Marshal.IsComObject(ns))Marshal.FinalReleaseComObject(ns);if(shell!=null&&Marshal.IsComObject(shell))Marshal.FinalReleaseComObject(shell);}
            result.TrySetResult(places);
        }){IsBackground=true};thread.SetApartmentState(ApartmentState.STA);thread.Start();return result.Task;
    }
}
