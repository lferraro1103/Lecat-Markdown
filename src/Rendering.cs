using System.Diagnostics;
using System.Net;
using System.Text.Json;
using Markdig;
using Markdig.Syntax;
using Markdig.Syntax.Inlines;
using Microsoft.Web.WebView2.Core;
namespace ClaroMD;
sealed partial class Reader
{
    int restoreScroll;
    int renderGeneration;
    JsonElement? lastRender;
    readonly List<string> mediaHosts=new();
    void HandleLink(string link)
    {
        if(!Uri.TryCreate(link,UriKind.Absolute,out var uri))return;
        if(uri.IsFile&&IsMarkdown(uri.LocalPath)){_=OpenFile(uri.LocalPath);return;}
        if(uri.Scheme=="https"||uri.Scheme=="http"){
            if(uri.Host.EndsWith(".claro.local")||uri.Host=="claro-assets.local")return;
            if(!testing)try{Process.Start(new ProcessStartInfo(link){UseShellExecute=true});}catch(Exception ex){SetStatus(ex.Message);}
        }
    }
    void WebMessage(object? sender,CoreWebView2WebMessageReceivedEventArgs e)
    {
        if(!e.Source.StartsWith("about:blank",StringComparison.OrdinalIgnoreCase))return;
        try{
            using var doc=JsonDocument.Parse(e.WebMessageAsJson);var data=doc.RootElement;
            var kind=data.GetProperty("type").GetString();
            if(kind=="link"){HandleLink(data.GetProperty("url").GetString()??"");return;}
            if(kind=="save-svg"&&!testing){var svg=data.GetProperty("svg").GetString();if(svg==null||svg.Length>4_000_000)return;using var dialog=new SaveFileDialog{Filter="Gráfico SVG|*.svg",FileName="diagrama.svg"};if(dialog.ShowDialog()==DialogResult.OK)File.WriteAllText(dialog.FileName,svg);return;}
            if(kind=="render"){
                if(data.GetProperty("generation").GetInt32()!=renderGeneration)return;
                lastRender=data.Clone();
                renderBadge.Text=$"{data.GetProperty("diagrams").GetInt32()} gráficos · {data.GetProperty("math").GetInt32()} fórmulas";
                outline.BeginUpdate();outline.Nodes.Clear();
                foreach(var h in data.GetProperty("headings").EnumerateArray()){
                    var node=new TreeNode(h.GetProperty("text").GetString()??""){Tag=h.GetProperty("id").GetString()};
                    outline.Nodes.Add(node);
                }
                outline.EndUpdate();
                if(restoreScroll>0){_=web.CoreWebView2.ExecuteScriptAsync($"window.scrollTo(0,{restoreScroll})");restoreScroll=0;}
            }
        }catch(JsonException){}catch(InvalidOperationException){}catch(KeyNotFoundException){}
    }
    void Render()
    {
        if(!ready)return;
        lastRender=null;renderBadge.Text="Preparando lectura…";int generation=++renderGeneration;
        foreach(var host in mediaHosts)web.CoreWebView2.ClearVirtualHostNameToFolderMapping(host);mediaHosts.Clear();
        var pipeline=new MarkdownPipelineBuilder().UseAdvancedExtensions().UseMathematics().DisableHtml().Build();
        var document=Markdown.Parse(markdown,pipeline);
        if(current!=""){
            var directory=Path.GetDirectoryName(current)!;int counter=0;
            foreach(var link in document.Descendants<LinkInline>()){
                var url=link.Url;
                if(string.IsNullOrWhiteSpace(url)||url.StartsWith('#'))continue;
                if(Uri.TryCreate(url,UriKind.Absolute,out var absolute)&&!absolute.IsFile){
                    if(link.IsImage&&url.StartsWith("data:image/",StringComparison.OrdinalIgnoreCase))continue;
                    if(absolute.Scheme is not ("http" or "https" or "mailto"))link.Url="#";
                    continue;
                }
                try{
                    var parts=url.Split('#',2);var path=absolute?.IsFile==true?absolute.LocalPath:Path.GetFullPath(Uri.UnescapeDataString(parts[0]),directory);
                    if(link.IsImage){
                        var host=$"media{counter++}.claro.local";
                        if(Directory.Exists(Path.GetDirectoryName(path))){
                            web.CoreWebView2.SetVirtualHostNameToFolderMapping(host,Path.GetDirectoryName(path)!,CoreWebView2HostResourceAccessKind.DenyCors);mediaHosts.Add(host);
                            link.Url=$"https://{host}/{Uri.EscapeDataString(Path.GetFileName(path))}";
                        }else link.Url=$"https://missing.claro.local/{Uri.EscapeDataString(Path.GetFileName(path))}";
                    }else link.Url=new Uri(path).AbsoluteUri+(parts.Length==2?"#"+parts[1]:"");
                }catch(ArgumentException){}catch(NotSupportedException){}catch(IOException){}
            }
        }
        string body=current==""?"<section class='welcome'><div class='eyebrow'>CLARO MD</div><h1>Tu biblioteca,<br>a mano.</h1><p>Explorá tus carpetas y encontrá un lugar tranquilo para leer.</p><div class='welcome-cards'><div><b>Tu disco, cerca</b><p>Acceso rápido y unidades en la biblioteca lateral.</p></div><div><b>Ideas que se ven</b><p>Diagramas, gráficos y fórmulas, incluso sin conexión.</p></div></div><p class='hint'>Ctrl+O · Abrir Markdown &nbsp;&nbsp; Ctrl+L · Ir a una carpeta</p></section>":Markdown.ToHtml(document,pipeline);
        var nonce=Convert.ToBase64String(System.Security.Cryptography.RandomNumberGenerator.GetBytes(18));
        string css=File.ReadAllText(Path.Combine(AppContext.BaseDirectory,"Assets","reader.css"));
        css=css.Replace("{{CANVAS}}",ColorTranslator.ToHtml(colors.Canvas)).Replace("{{TEXT}}",ColorTranslator.ToHtml(colors.Text)).Replace("{{MUTED}}",ColorTranslator.ToHtml(colors.Muted)).Replace("{{PANEL}}",ColorTranslator.ToHtml(colors.Panel)).Replace("{{BORDER}}",ColorTranslator.ToHtml(colors.Border)).Replace("{{ACCENT}}",ColorTranslator.ToHtml(colors.Accent)).Replace("{{SELECT}}",ColorTranslator.ToHtml(colors.Selection));
        string remote=prefs.RemoteImages?"https: http:":"";
        web.NavigateToString($$"""
<!doctype html><html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src https://claro-assets.local 'nonce-{{nonce}}'; style-src 'unsafe-inline' https://claro-assets.local; img-src https://*.claro.local data: {{remote}}; font-src https://claro-assets.local; connect-src 'none'; object-src 'none'; frame-src 'none'; base-uri 'none';">
<link rel="stylesheet" href="https://claro-assets.local/vendor/katex/katex.min.css">
<link rel="stylesheet" href="https://claro-assets.local/vendor/github{{(prefs.Dark?"-dark":"")}}.min.css">
<style>{{css}}</style></head><body data-dark="{{prefs.Dark.ToString().ToLowerInvariant()}}" data-remote="{{prefs.RemoteImages.ToString().ToLowerInvariant()}}" data-generation="{{generation}}">
<main><article>{{body}}</article></main>
<dialog id="graphic-dialog"><div class="dialog-tools"><span>Vista ampliada</span><button id="dialog-close" aria-label="Cerrar vista ampliada">Cerrar ×</button></div><div id="graphic-content"></div></dialog>
<script nonce="{{nonce}}" src="https://claro-assets.local/vendor/mermaid.min.js"></script>
<script nonce="{{nonce}}" src="https://claro-assets.local/vendor/katex/katex.min.js"></script>
<script nonce="{{nonce}}" src="https://claro-assets.local/vendor/highlight.min.js"></script>
<script nonce="{{nonce}}" src="https://claro-assets.local/reader.js"></script>
</body></html>
""");
    }
}
