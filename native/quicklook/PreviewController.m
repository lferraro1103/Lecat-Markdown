#import <Cocoa/Cocoa.h>
#import <Quartz/Quartz.h>
#import <WebKit/WebKit.h>

@interface LecatPreviewController : NSViewController <QLPreviewingController, WKNavigationDelegate, WKScriptMessageHandler>
@property NSUInteger requestID;
@property WKWebView *web;
@property WKNavigation *navigation;
@property NSURL *sourceURL;
@property NSString *source;
@property(copy) void (^completion)(NSError *);
@end

@implementation LecatPreviewController
- (void)loadView {
    WKWebViewConfiguration *config = [WKWebViewConfiguration new];
    config.websiteDataStore = [WKWebsiteDataStore nonPersistentDataStore];
    [config.userContentController addScriptMessageHandler:self name:@"complete"];
    [config.userContentController addScriptMessageHandler:self name:@"link"];
    self.web = [[WKWebView alloc] initWithFrame:NSMakeRect(0,0,820,650) configuration:config];
    self.web.navigationDelegate = self;
    self.web.allowsMagnification = YES;
    self.view = self.web;
    self.preferredContentSize = NSMakeSize(820,650);
}
- (void)finish:(NSError *)error {
    if (!self.completion) return;
    void (^completion)(NSError *) = self.completion;
    self.completion = nil;
    completion(error);
}
- (void)preparePreviewOfFileAtURL:(NSURL *)url completionHandler:(void (^)(NSError *))handler {
    [self finish:[NSError errorWithDomain:NSCocoaErrorDomain code:NSUserCancelledError userInfo:nil]];
    self.completion = handler;
    NSUInteger requestID = ++self.requestID;
    NSNumber *size; NSError *error;
    if (![url getResourceValue:&size forKey:NSURLFileSizeKey error:&error] || size.unsignedLongLongValue > 20*1024*1024) {
        [self finish:error ?: [NSError errorWithDomain:NSCocoaErrorDomain code:NSFileReadTooLargeError userInfo:nil]]; return;
    }
    NSData *data = [NSData dataWithContentsOfURL:url options:NSDataReadingMappedIfSafe error:&error];
    self.source = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
    if (!self.source && data.length >= 2 && ((const unsigned char *)data.bytes)[0] == 255 && ((const unsigned char *)data.bytes)[1] == 254)
        self.source = [[NSString alloc] initWithData:data encoding:NSUTF16LittleEndianStringEncoding];
    if (!self.source) { [self finish:error ?: [NSError errorWithDomain:NSCocoaErrorDomain code:NSFileReadInapplicableStringEncodingError userInfo:nil]]; return; }
    self.sourceURL = url;
    (void)self.view;
    NSURL *root = [[NSBundle bundleForClass:self.class].resourceURL URLByAppendingPathComponent:@"web"];
    self.navigation = [self.web loadFileURL:[root URLByAppendingPathComponent:@"index.html"] allowingReadAccessToURL:root];
    __weak typeof(self) weakSelf = self;
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, 30*NSEC_PER_SEC), dispatch_get_main_queue(), ^{
        if (weakSelf.requestID == requestID) [weakSelf finish:[NSError errorWithDomain:NSURLErrorDomain code:NSURLErrorTimedOut userInfo:nil]];
    });
}
- (void)webView:(WKWebView *)webView didFinishNavigation:(WKNavigation *)navigation {
    if (!self.completion || navigation != self.navigation) return;
    NSUInteger requestID = self.requestID;
    NSData *sourceJSON = [NSJSONSerialization dataWithJSONObject:@[self.source] options:0 error:nil];
    NSString *sourceArray = [[NSString alloc] initWithData:sourceJSON encoding:NSUTF8StringEncoding];
    __weak typeof(self) weakSelf = self;
    [webView evaluateJavaScript:[NSString stringWithFormat:@"window.lecatImageURLs((%@)[0])",sourceArray] completionHandler:^(id result,NSError *error) {
        typeof(self) owner = weakSelf; if (!owner || !owner.completion || owner.requestID != requestID) return;
        NSMutableDictionary *images = [NSMutableDictionary new];
        NSURL *base = owner.sourceURL.URLByDeletingLastPathComponent.URLByResolvingSymlinksInPath;
        NSString *prefix = [base.path stringByAppendingString:@"/"];
        NSDictionary *types = @{@"png":@"image/png",@"jpg":@"image/jpeg",@"jpeg":@"image/jpeg",@"gif":@"image/gif",@"webp":@"image/webp",@"svg":@"image/svg+xml"};
        NSUInteger budget = 0;
        if ([result isKindOfClass:NSArray.class]) for (NSString *href in (NSArray *)result) {
            if (![href isKindOfClass:NSString.class] || [href hasPrefix:@"/"] || [href containsString:@":"] || [href hasPrefix:@"//"]) continue;
            NSString *decoded = href.stringByRemovingPercentEncoding; if (!decoded) continue;
            NSURL *image = [base URLByAppendingPathComponent:decoded].URLByResolvingSymlinksInPath;
            NSString *type = types[image.pathExtension.lowercaseString];
            if (!type || ![image.path hasPrefix:prefix]) continue;
            NSNumber *size; if (![image getResourceValue:&size forKey:NSURLFileSizeKey error:nil] || size.unsignedLongLongValue > 2*1024*1024 || budget+size.unsignedLongLongValue > 20*1024*1024) continue;
            NSData *bytes = [NSData dataWithContentsOfURL:image]; if (!bytes) continue;
            budget += bytes.length; images[href] = [NSString stringWithFormat:@"data:%@;base64,%@",type,[bytes base64EncodedStringWithOptions:0]];
        }
        NSData *json = [NSJSONSerialization dataWithJSONObject:@{@"source":owner.source,@"images":images} options:0 error:nil];
        NSString *script = [NSString stringWithFormat:@"(function(){window.lecatPreview(%@);return null;})()",[[NSString alloc] initWithData:json encoding:NSUTF8StringEncoding]];
        [webView evaluateJavaScript:script completionHandler:^(id value,NSError *error){if (error) [weakSelf finish:error];}];
    }];
}
- (void)webView:(WKWebView *)webView didFailNavigation:(WKNavigation *)navigation withError:(NSError *)error { if (navigation == self.navigation) [self finish:error]; }
- (void)webView:(WKWebView *)webView didFailProvisionalNavigation:(WKNavigation *)navigation withError:(NSError *)error { [self finish:error]; }
- (void)webView:(WKWebView *)webView decidePolicyForNavigationAction:(WKNavigationAction *)action decisionHandler:(void (^)(WKNavigationActionPolicy))handler {
    handler(action.navigationType == WKNavigationTypeLinkActivated ? WKNavigationActionPolicyCancel : WKNavigationActionPolicyAllow);
}
- (void)userContentController:(WKUserContentController *)controller didReceiveScriptMessage:(WKScriptMessage *)message {
    if (!message.frameInfo.mainFrame) return;
    if ([message.name isEqual:@"complete"]) { [self finish:nil]; return; }
    if (![message.name isEqual:@"link"] || ![message.body isKindOfClass:NSString.class]) return;
    NSString *href = message.body; NSURL *target = [NSURL URLWithString:href];
    if (!target.scheme || href.length > 8192) return;
    NSURLComponents *host = [NSURLComponents componentsWithString:@"lecat://link"];
    host.queryItems = @[[NSURLQueryItem queryItemWithName:@"url" value:href]];
    [[NSWorkspace sharedWorkspace] openURL:host.URL];
}
@end
