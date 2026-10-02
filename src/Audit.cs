using System.Drawing.Imaging;
using System.Text.Json;
using Microsoft.Web.WebView2.Core;
namespace ClaroMD;
sealed partial class Reader
{
    async Task WaitForPreview()
    {
        var until=DateTime.UtcNow.AddSeconds(45);
        while(DateTime.UtcNow<until){
            if(await web.CoreWebView2.ExecuteScriptAsync("window.__claroReady===true")=="true"){
                var failure=await web.CoreWebView2.ExecuteScriptAsync("window.__claroFailure||null");
                if(failure!="null")throw new Exception("Renderer bootstrap: "+failure);
                return;
            }
            await Task.Delay(200);
        }
        throw new TimeoutException("Preview rendering did not finish");
    }
    async Task<JsonDocument> Dom(string expression)
    {
        var result=await web.CoreWebView2.ExecuteScriptAsync("JSON.stringify("+expression+")");
        return JsonDocument.Parse(JsonSerializer.Deserialize<string>(result)!);
    }
    async Task CaptureAudit(string path)
    {
        using var previewStream=new MemoryStream();
        await web.CoreWebView2.CapturePreviewAsync(CoreWebView2CapturePreviewImageFormat.Png,previewStream);
        previewStream.Position=0;using var previewImage=Image.FromStream(previewStream);
        using var shell=new Bitmap(Width,Height);
        DrawToBitmap(shell,new Rectangle(Point.Empty,Size));
        using(var g=Graphics.FromImage(shell)){
            var screenPoint=web.PointToScreen(Point.Empty);
            var location=new Point(screenPoint.X-Location.X,screenPoint.Y-Location.Y);
            g.DrawImage(previewImage,new Rectangle(location,web.Size));
        }
        shell.Save(path,ImageFormat.Png);
    }
    async Task Audit()
    {
        var output=Path.Combine(AppContext.BaseDirectory,"audit-output");Directory.CreateDirectory(output);
        var results=new List<string>();
        void Check(bool condition,string name){if(!condition)throw new Exception(name);results.Add("PASS "+name);}
        try{
            Check(ready,"WebView2 initialized");
            var root=Path.Combine(Path.GetTempPath(),"ClaroMD-audit-"+Guid.NewGuid());
            Directory.CreateDirectory(root);Directory.CreateDirectory(Path.Combine(root,"child"));
            var fixture=Path.Combine(root,"Auditoría gráficos.md");
            await File.WriteAllTextAsync(fixture,File.ReadAllText(Path.Combine(AppContext.BaseDirectory,"Assets","audit.md")));
            await File.WriteAllTextAsync(Path.Combine(root,"pixel.svg"),"<svg xmlns='http://www.w3.org/2000/svg' width='120' height='48'><rect width='120' height='48' rx='8' fill='#2563eb'/><text x='10' y='30' fill='white'>SVG local</text></svg>");
            using(var image=Art.Logo(64))image.Save(Path.Combine(root,"imagen á con espacios.png"),ImageFormat.Png);
            await File.WriteAllTextAsync(Path.Combine(root,"ignored.txt"),"ignore");
            await NavigateFolder(root);
            Check(documents.Count==1,"Markdown extension filtering");
            filter.Text="unknown";Check(files.Items.Count==0&&empty.Visible,"filtered empty state");filter.Clear();
            var n=Node("test",root);await LoadNode(n);Check(n.Nodes.Count==1&&n.Nodes[0].Text=="child","lazy folder enumeration");
            var quick=tree.Nodes.Find("quick",false).Single();
            Check(quick.Nodes.Cast<TreeNode>().Any(x=>x.Text=="Descargas")&&quick.Nodes.Cast<TreeNode>().Any(x=>x.Text=="Escritorio")&&quick.Nodes.Cast<TreeNode>().Any(x=>x.Text=="Documentos"),"Windows quick access known folders");
            Check(tree.Nodes.Find("drives",false).Single().Nodes.Count==DriveInfo.GetDrives().Length,"all Windows drives beneath separator");
            await OpenFile(fixture);await WaitForPreview();
            using(var dom=await Dom("({state:window.__claroState,svg:[...document.querySelectorAll('.diagram-content svg')].map(s=>({w:s.viewBox.baseVal.width,h:s.viewBox.baseVal.height})),images:[...document.querySelectorAll('article img')].map(i=>({w:i.naturalWidth,src:i.src})),math:document.querySelectorAll('.katex').length,highlight:document.querySelectorAll('.hljs').length,table:document.querySelectorAll('.table-scroll').length,scripts:[...document.scripts].map(s=>s.src),injected:window.__injected||false,overflow:document.documentElement.scrollWidth>innerWidth})")){
                File.WriteAllText(Path.Combine(output,"render-dom.json"),dom.RootElement.GetRawText());
                var data=dom.RootElement;var state=data.GetProperty("state");
                Check(state.GetProperty("diagrams").GetInt32()==10,"ten Mermaid families render (flow, sequence, class, ER, state, pie, gantt, mindmap, timeline, XY)");
                Check(state.GetProperty("errors").GetInt32()==1,"invalid Mermaid isolated with readable fallback");
                Check(data.GetProperty("svg").EnumerateArray().All(s=>s.GetProperty("w").GetDouble()>0&&s.GetProperty("h").GetDouble()>0),"all diagram SVG viewboxes have nonzero dimensions");
                Check(data.GetProperty("images")[0].GetProperty("w").GetInt32()==120&&data.GetProperty("images")[1].GetProperty("w").GetInt32()==64,"SVG and Unicode/space PNG paths load");
                Check(data.GetProperty("math").GetInt32()>=2,"inline and display math rendered with KaTeX");
                Check(data.GetProperty("highlight").GetInt32()>=1,"syntax highlighting");
                Check(data.GetProperty("table").GetInt32()>=1,"tables receive independent horizontal scrolling");
                Check(!data.GetProperty("injected").GetBoolean()&&data.GetProperty("scripts").EnumerateArray().All(s=>s.GetString()!.StartsWith("https://claro-assets.local/")),"raw Markdown script injection blocked; only packaged scripts");
                Check(!data.GetProperty("overflow").GetBoolean(),"reading pane has no document-wide horizontal overflow");
            }
            Check(outline.Nodes.Count>10,"heading outline populated");
            using(var chart=await Dom("({text:document.querySelectorAll('.diagram-content svg')[1].textContent,rects:document.querySelectorAll('.diagram-content svg')[1].querySelectorAll('rect').length})")){
                Check(chart.RootElement.GetProperty("text").GetString()!.Contains("Documentos por mes")&&chart.RootElement.GetProperty("rects").GetInt32()>=4,"XY chart contains its title and plotted bars");
            }
            await web.CoreWebView2.ExecuteScriptAsync("document.querySelector('.graphic-tools button').click()");
            using(var diagram=await Dom("document.querySelector('.diagram-card').classList.contains('show-code')"))Check(diagram.RootElement.GetBoolean(),"diagram source toggle");
            await web.CoreWebView2.ExecuteScriptAsync("document.querySelector('.graphic-tools button').click();document.querySelectorAll('.graphic-tools button')[1].click()");
            using(var dialog=await Dom("document.getElementById('graphic-dialog').open"))Check(dialog.RootElement.GetBoolean(),"diagram enlarged view");
            await web.CoreWebView2.ExecuteScriptAsync("document.getElementById('graphic-dialog').close()");
            ToggleOutline();Check(!reading.Panel2Collapsed,"outline toggles");ToggleOutline();
            SetMode(true);Check(source.Visible&&!web.Visible,"source mode");SetMode(false);
            SetZoom(1.3);Check(Math.Abs(web.ZoomFactor-1.3)<.01,"reading zoom");SetZoom(1);
            ShowFind();findText.Text="Auditoría";await Find();Check(findState.Text=="Encontrado","document text search");findPanel.Hide();
            await web.CoreWebView2.ExecuteScriptAsync("window.getSelection()?.removeAllRanges()");
            tree.TopNode=tree.Nodes[0];
            await CaptureAudit(Path.Combine(output,"light.png"));
            await web.CoreWebView2.ExecuteScriptAsync("document.getElementById('formulas').scrollIntoView({block:'start',behavior:'instant'})");
            await CaptureAudit(Path.Combine(output,"math-images.png"));
            await web.CoreWebView2.ExecuteScriptAsync("window.scrollTo({top:0,behavior:'instant'})");
            prefs.Dark=true;ApplyTheme();Render();await WaitForPreview();await CaptureAudit(Path.Combine(output,"dark.png"));
            Check(colors.Canvas==ColorTranslator.FromHtml("#11161D"),"dark theme and diagrams");
            Width=900;Height=650;ResizeAddress();Render();await WaitForPreview();
            await CaptureAudit(Path.Combine(output,"compact.png"));
            File.WriteAllText(Path.Combine(output,"layout.json"),JsonSerializer.Serialize(new{dpi=DeviceDpi,address=new{pathBox.Width,pathBox.Visible,pathBox.Placement,pathBox.Bounds},navigation=navigation.Items.Cast<ToolStripItem>().Select(i=>new{i.Name,i.Visible,i.Placement,i.Bounds}),document=documentTools.Items.Cast<ToolStripItem>().Select(i=>new{i.Name,i.Visible,i.Placement,i.Bounds})}));
            Check(pathBox.Width>=180&&pathBox.Placement==ToolStripItemPlacement.Main&&reading.Width>200,"compact layout keeps address and reading area");
            Width=1360;Height=900;ResizeAddress();
            string heldout="# Casos adversos\n\n~~~mermaid\n%%{init: {securityLevel: 'loose'}}%%\nflowchart LR\nA --> B\n~~~\n\n![Missing](missing-file.png)\n\n![Remote](https://example.com/test.png)\n\n~~~python\nprint('visible')\n~~~";
            var hostile=Path.Combine(root,"adversos.md");await File.WriteAllTextAsync(hostile,heldout);await OpenFile(hostile);await WaitForPreview();
            using(var dom=await Dom("({errors:window.__claroState.errors,fallbacks:[...document.querySelectorAll('.media-error')].map(e=>e.textContent),code:document.querySelector('code.language-python')?.textContent})")){
                Check(dom.RootElement.GetProperty("errors").GetInt32()==1,"Mermaid embedded security override rejected");
                Check(dom.RootElement.GetProperty("fallbacks").GetArrayLength()==2,"missing and blocked remote images have explicit fallback");
                Check(dom.RootElement.GetProperty("code").GetString()!.Contains("print"),"content after rendering error survives");
            }
            await File.WriteAllTextAsync(Path.Combine(root,"segundo archivo.md"),"# Segundo documento\n\nFin");
            HandleLink(new Uri(Path.Combine(root,"segundo archivo.md")).AbsoluteUri);await Task.Delay(300);
            Check(Path.GetFileName(current)=="segundo archivo.md","local Markdown link with spaces");
            await File.WriteAllTextAsync(current,"# Modificado");
            await Task.Delay(2200);Check(markdown=="# Modificado","automatic external modification reload");
            await NavigateFolder(Path.Combine(root,"absent"));Check(SamePath(folder,root),"missing folder does not corrupt navigation");
            await NavigateFolder(Path.Combine(root,"child"));NavigateHistory(back,forward);await Task.Delay(300);Check(SamePath(folder,root),"navigation history");
            var original=current;await OpenFile(Path.Combine(root,"ignored.txt"));Check(current==original,"unsupported extension rejected without losing current file");
            Check(Icon!=null&&typeof(Reader).Assembly.GetManifestResourceNames().Contains("ClaroMD.Assets.ClaroMD.ico"),"application icon embedded and assigned");
            var icoPath=Path.Combine(AppContext.BaseDirectory,"Assets","ClaroMD.ico");using(var iconReader=new BinaryReader(File.OpenRead(icoPath))){iconReader.ReadUInt16();iconReader.ReadUInt16();Check(iconReader.ReadUInt16()==9,"nine-resolution ICO");}
            foreach(bool dark in new[]{false,true}){
                var p=Palette.For(dark);Check(Contrast(p.Text,p.Canvas)>=4.5&&Contrast(p.Muted,p.Panel)>=4.5&&Contrast(p.Accent,p.Canvas)>=4.5,$"{(dark?"dark":"light")} text and links contrast >=4.5:1");
            }
            results.Add("SUCCESS");
        }catch(Exception ex){results.Add("FAIL "+ex);}
        File.WriteAllLines(Path.Combine(output,"audit-results.txt"),results);
        File.WriteAllLines(Path.Combine(AppContext.BaseDirectory,"smoke-test.txt"),results);
        Close();
    }
    static double Contrast(Color a,Color b)
    {
        double L(Color c){double V(byte channel){double v=channel/255d;return v<=.04045?v/12.92:Math.Pow((v+.055)/1.055,2.4);}return .2126*V(c.R)+.7152*V(c.G)+.0722*V(c.B);}
        double x=L(a),y=L(b);return (Math.Max(x,y)+.05)/(Math.Min(x,y)+.05);
    }
}

