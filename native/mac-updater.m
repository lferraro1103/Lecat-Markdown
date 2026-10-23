#import <Cocoa/Cocoa.h>
#import <Sparkle/Sparkle.h>
#include <signal.h>

static void emit(NSDictionary *event) {
    NSData *data = [NSJSONSerialization dataWithJSONObject:event options:0 error:nil];
    fwrite(data.bytes, 1, data.length, stdout); fputc('\n', stdout); fflush(stdout);
}
@interface LecatUpdateDriver : NSObject <SPUUserDriver, SPUUpdaterDelegate>
@property(strong) SPUUpdater *updater;
@property uint64_t received;
@property uint64_t expected;
@property(strong) NSURL *feed;
@end
@implementation LecatUpdateDriver
- (void)showUpdatePermissionRequest:(SPUUpdatePermissionRequest *)request reply:(void (^)(SUUpdatePermissionResponse *))reply {
    reply([[SUUpdatePermissionResponse alloc] initWithAutomaticUpdateChecks:NO sendSystemProfile:NO]);
}
- (void)showUserInitiatedUpdateCheckWithCancellation:(void (^)(void))cancellation {}
- (void)showUpdateFoundWithAppcastItem:(SUAppcastItem *)item state:(SPUUserUpdateState *)state reply:(void (^)(SPUUserUpdateChoice))reply {
    if (item.informationOnlyUpdate) { reply(SPUUserUpdateChoiceDismiss); emit(@{@"event":@"error",@"message":@"Esta versión requiere instalación manual."}); exit(1); }
    reply(SPUUserUpdateChoiceInstall);
}
- (void)showUpdateReleaseNotesWithDownloadData:(SPUDownloadData *)data {}
- (void)showUpdateReleaseNotesFailedToDownloadWithError:(NSError *)error {}
- (void)showUpdateNotFoundWithError:(NSError *)error acknowledgement:(void (^)(void))ack { emit(@{@"event":@"error",@"message":@"La actualización seleccionada ya no está disponible."}); ack(); exit(1); }
- (void)showUpdaterError:(NSError *)error acknowledgement:(void (^)(void))ack { emit(@{@"event":@"error",@"message":error.localizedDescription}); ack(); exit(1); }
- (void)showDownloadInitiatedWithCancellation:(void (^)(void))cancellation {}
- (void)showDownloadDidReceiveExpectedContentLength:(uint64_t)length { self.expected=length; }
- (void)showDownloadDidReceiveDataOfLength:(uint64_t)length { self.received+=length; }
- (void)showDownloadDidStartExtractingUpdate { emit(@{@"event":@"extracting"}); }
- (void)showExtractionReceivedProgress:(double)progress {}
- (void)showReadyToInstallAndRelaunch:(void (^)(SPUUserUpdateChoice))reply { emit(@{@"event":@"ready"}); reply(SPUUserUpdateChoiceInstall); }
- (void)showInstallingUpdateWithApplicationTerminated:(BOOL)terminated retryTerminatingApplication:(void (^)(void))retry { emit(@{@"event":@"installing"}); }
- (void)showUpdateInstalledAndRelaunched:(BOOL)relaunched acknowledgement:(void (^)(void))ack { emit(@{@"event":@"installed",@"relaunched":@(relaunched)}); ack(); exit(0); }
- (void)dismissUpdateInstallation {}
- (BOOL)updater:(SPUUpdater *)updater shouldDownloadReleaseNotesForUpdate:(SUAppcastItem *)item { return NO; }
- (NSString *)feedURLStringForUpdater:(SPUUpdater *)updater { return self.feed.absoluteString; }
- (void)updater:(SPUUpdater *)updater didAbortWithError:(NSError *)error { emit(@{@"event":@"error",@"message":error.localizedDescription}); exit(1); }
@end

int main(int argc, const char *argv[]) {
    @autoreleasepool {
        signal(SIGPIPE, SIG_IGN);
        [NSApplication sharedApplication]; [NSApp setActivationPolicy:NSApplicationActivationPolicyAccessory];
        if (argc != 2) return 2;
        NSURL *feed=[NSURL URLWithString:@(argv[1])];
        if (![feed.scheme isEqualToString:@"http"] || ![feed.host isEqualToString:@"127.0.0.1"] || !feed.port) return 2;
        // The helper is inside the only application it is allowed to replace.
        NSString *helperPath=NSBundle.mainBundle.bundlePath.stringByResolvingSymlinksInPath;
        if (![NSBundle.mainBundle.bundleIdentifier isEqualToString:@"com.lecat.markdown.updater"]) return 2;
        NSString *appPath=helperPath.stringByDeletingLastPathComponent.stringByDeletingLastPathComponent.stringByDeletingLastPathComponent;
        NSBundle *host=[NSBundle bundleWithPath:appPath];
        if (!host || ![host.bundleIdentifier isEqualToString:@"com.lecat.markdown"] || ![host objectForInfoDictionaryKey:@"SUPublicEDKey"]) return 2;
        LecatUpdateDriver *driver=[LecatUpdateDriver new];
        driver.feed=feed;
        driver.updater=[[SPUUpdater alloc] initWithHostBundle:host applicationBundle:host userDriver:driver delegate:driver];
        NSError *error=nil;
        if (![driver.updater startUpdater:&error]) { emit(@{@"event":@"error",@"message":error.localizedDescription ?: @"No se pudo iniciar el actualizador."}); return 1; }
        [driver.updater checkForUpdates]; [NSApp run];
    }
    return 0;
}
