using System.Diagnostics;
using System.Text.Json;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;
namespace ClaroMD;

static class Program
{
    [STAThread] static void Main(string[] args)
    {
        ApplicationConfiguration.Initialize();
        if(args.Length==2 && args[0]=="--create-icons"){Art.CreateAssets(args[1]);return;}
        Application.Run(new Reader(args));
    }
}
sealed class Preferences
{
    public string Folder {get;set;}=Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments);
    public bool Dark {get;set;}
    public bool RemoteImages {get;set;}
    public double Zoom {get;set;}=1;
}
sealed partial class Reader : Form
{
    readonly TreeView tree=new(){Dock=DockStyle.Fill,HideSelection=false,BorderStyle=BorderStyle.None,ShowLines=false,ShowRootLines=false,FullRowSelect=true,ShowNodeToolTips=true,ItemHeight=32,DrawMode=TreeViewDrawMode.OwnerDrawText};
    readonly ListBox files=new(){Dock=DockStyle.Fill,BorderStyle=BorderStyle.None,IntegralHeight=false,DrawMode=DrawMode.OwnerDrawFixed,ItemHeight=48,AccessibleName="Documentos Markdown"};
    readonly TextBox filter=new(){Dock=DockStyle.Fill,BorderStyle=BorderStyle.FixedSingle,PlaceholderText="Filtrar documentos…",AccessibleName="Filtrar documentos"};
    readonly WebView2 web=new(){Dock=DockStyle.Fill,AccessibleName="Lectura del documento"};
    readonly RichTextBox source=new(){Dock=DockStyle.Fill,ReadOnly=true,BorderStyle=BorderStyle.None,Font=new Font("Consolas",11),WordWrap=false,AccessibleName="Código Markdown original"};
    readonly SplitContainer outer=new(){Dock=DockStyle.Fill,FixedPanel=FixedPanel.Panel1,SplitterWidth=4};
    readonly SplitContainer sidebar=new(){Dock=DockStyle.Fill,Orientation=Orientation.Horizontal,SplitterWidth=4};
    readonly SplitContainer reading=new(){Dock=DockStyle.Fill,FixedPanel=FixedPanel.Panel2,SplitterWidth=4,Panel2Collapsed=true};
    readonly TreeView outline=new(){Dock=DockStyle.Fill,BorderStyle=BorderStyle.None,HideSelection=false,ShowLines=false,FullRowSelect=true,ItemHeight=30,AccessibleName="Índice de encabezados"};
    readonly Panel preview=new(){Dock=DockStyle.Fill};
    readonly Panel docHeader=new(){Dock=DockStyle.Top,Height=84,Padding=new Padding(24,12,24,8)};
    readonly Label title=new(){Dock=DockStyle.Top,Height=35,AutoEllipsis=true,Font=new Font("Segoe UI Semibold",16),Text="Tu biblioteca, a mano."};
    readonly Label subtitle=new(){Dock=DockStyle.Fill,AutoEllipsis=true,Font=new Font("Segoe UI",9)};
    readonly Label empty=new(){Dock=DockStyle.Fill,TextAlign=ContentAlignment.MiddleCenter,Padding=new Padding(16),Font=new Font("Segoe UI",10)};
    readonly Label fileCount=new(){Dock=DockStyle.Top,Height=36,Padding=new Padding(12,8,0,0),Font=new Font("Segoe UI Semibold",10)};
    readonly ToolStrip navigation=new(){Dock=DockStyle.Top,Height=56,AutoSize=false,GripStyle=ToolStripGripStyle.Hidden,Padding=new Padding(12,8,12,8)};
    readonly ToolStrip documentTools=new(){Dock=DockStyle.Top,Height=48,AutoSize=false,GripStyle=ToolStripGripStyle.Hidden,Padding=new Padding(16,4,16,4)};
    readonly ToolStripTextBox pathBox=new(){AutoSize=false,Width=360,AccessibleName="Ruta de la carpeta"};
    readonly MenuStrip menu=new(){Dock=DockStyle.Top,Height=32,AutoSize=false,Padding=new Padding(8,2,8,2)};
    readonly StatusStrip status=new(){SizingGrip=false,Height=30};
    readonly ToolStripStatusLabel statusText=new(){Spring=true,TextAlign=ContentAlignment.MiddleLeft,AutoToolTip=true};
    readonly ToolStripStatusLabel renderBadge=new(){Text="Markdown · sin conexión"};
    readonly ToolStripLabel zoomLabel=new(){Text="100 %",AutoSize=false,Width=62,TextAlign=ContentAlignment.MiddleCenter};
    readonly ToolTip tips=new(){ShowAlways=true};
    readonly Panel findPanel=new(){Dock=DockStyle.Top,Height=48,Padding=new Padding(16,8,16,8),Visible=false};
    readonly TextBox findText=new(){Dock=DockStyle.Fill,PlaceholderText="Buscar en el documento…",AccessibleName="Buscar texto"};
    readonly Label findState=new(){Dock=DockStyle.Right,Width=80,TextAlign=ContentAlignment.MiddleCenter};
    readonly Stack<string> back=new(),forward=new();
    readonly string prefsPath=Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),"ClaroMD","settings.json");
    readonly System.Windows.Forms.Timer poll=new(){Interval=1500};
    readonly string[] args;
    readonly List<ToolStrip> bars=new();
    readonly List<ToolStripItem> requiresDocument=new();
    readonly Dictionary<string,ToolStripButton> buttons=new();
    Preferences prefs=new();
    Palette colors=Palette.For(false);
    string folder="",current="",markdown="";
    List<string> documents=new();
    bool ready,sourceMode,filtering,testing;
    int folderVersion,fileVersion;
    DateTime lastWrite;
    bool deletedWarning;
    public Reader(string[] arguments)
    {
        args=arguments; testing=args.Contains("--smoke-test")||args.Contains("--audit");
        AutoScaleMode=AutoScaleMode.Dpi;AutoScaleDimensions=new SizeF(96,96);
        Text="Claro MD";Width=1360;Height=900;MinimumSize=new Size(900,600);
        Font=new Font("Segoe UI",10.5f);StartPosition=FormStartPosition.CenterScreen;
        try{prefs=JsonSerializer.Deserialize<Preferences>(File.ReadAllText(prefsPath))??new();}catch{}
        prefs.Zoom=Math.Clamp(prefs.Zoom,.5,2.5);
        if(testing){prefs.Dark=false;prefs.RemoteImages=false;prefs.Zoom=1;}
        try{using var stream=typeof(Reader).Assembly.GetManifestResourceStream("ClaroMD.Assets.ClaroMD.ico");if(stream!=null)Icon=new Icon(stream);}catch{}
        BuildLayout();BuildCommands();WireEvents();ApplyTheme();
        Shown+=async(_,_)=>await Initialize();
    }
    void WireEvents()
    {
        tree.BeforeExpand+=async(_,e)=>{if(e.Node?.Tag is string)await LoadNode(e.Node);};
        tree.AfterSelect+=(_,e)=>{if(e.Node?.Tag is string p)_=NavigateFolder(p);};
        filter.TextChanged+=(_,_)=>FilterFiles();
        files.SelectedIndexChanged+=(_,_)=>{if(!filtering&&files.SelectedItem is Doc d)_=OpenFile(d.Path);};
        files.MouseDown+=(_,e)=>{if(e.Button==MouseButtons.Right){var i=files.IndexFromPoint(e.Location);if(i>=0){filtering=true;files.SelectedIndex=i;filtering=false;}}};
        tree.MouseDown+=(_,e)=>{if(e.Button==MouseButtons.Right)tree.SelectedNode=tree.GetNodeAt(e.Location);};
        pathBox.KeyDown+=(_,e)=>{if(e.KeyCode==Keys.Enter){e.SuppressKeyPress=true;_=NavigateFolder(pathBox.Text);}};
        findText.KeyDown+=async(_,e)=>{if(e.KeyCode==Keys.Enter){e.SuppressKeyPress=true;await Find(e.Shift);}if(e.KeyCode==Keys.Escape)findPanel.Hide();};
        outline.AfterSelect+=async(_,e)=>{if(ready&&e.Node?.Tag is string id)await web.CoreWebView2.ExecuteScriptAsync($"document.getElementById({JsonSerializer.Serialize(id)})?.scrollIntoView({{behavior:'smooth',block:'start'}})");};
        AllowDrop=true;
        DragEnter+=(_,e)=>{if(e.Data?.GetDataPresent(DataFormats.FileDrop)==true)e.Effect=DragDropEffects.Copy;};
        DragDrop+=(_,e)=>{if(e.Data?.GetData(DataFormats.FileDrop)is string[] paths&&paths.Length>0){if(Directory.Exists(paths[0]))_=NavigateFolder(paths[0]);else _=OpenFile(paths[0]);}};
        FormClosing+=(_,_)=>{poll.Stop();if(testing)return;try{prefs.Folder=folder;Directory.CreateDirectory(Path.GetDirectoryName(prefsPath)!);File.WriteAllText(prefsPath,JsonSerializer.Serialize(prefs));}catch{}};
        poll.Tick+=async(_,_)=>{
            if(current=="")return;
            if(!File.Exists(current)){if(!deletedWarning){SetStatus("El documento ya no existe en el disco. Se conserva la última lectura.");deletedWarning=true;}return;}
            if(File.GetLastWriteTimeUtc(current)!=lastWrite){var y=ready?await web.CoreWebView2.ExecuteScriptAsync("window.scrollY"):"0";restoreScroll=int.TryParse(y,out var scroll)?scroll:0;await OpenFile(current);}
        };
        DpiChanged+=(_,_)=>{ApplyTheme();ResizeAddress();};
    }
    async Task Initialize()
    {
        outer.SplitterDistance=Math.Clamp((int)(300*DeviceDpi/96f),220,Math.Max(220,Width-500));
        outer.Panel1MinSize=220;sidebar.SplitterDistance=Math.Max(240,sidebar.Height*58/100);sidebar.Panel1MinSize=180;sidebar.Panel2MinSize=120;
        reading.SplitterDistance=Math.Max(100,reading.Width-220);
        var quick=new TreeNode("Acceso rápido"){Name="quick"};var drives=new TreeNode("Este equipo"){Name="drives"};
        tree.Nodes.Add(quick);tree.Nodes.Add(drives);
        foreach(var place in WindowsPlaces.Standard())if(place.Path!="")quick.Nodes.Add(Node(place.Label,place.Path,place.Icon));
        foreach(var drive in DriveInfo.GetDrives()){string name=drive.Name;try{if(drive.IsReady&&!string.IsNullOrWhiteSpace(drive.VolumeLabel))name=$"{drive.VolumeLabel} ({drive.Name.TrimEnd('\\')})";}catch{}drives.Nodes.Add(Node(name,drive.Name,"drive"));}
        quick.Expand();drives.Expand();_=AddShellPlaces(quick);
        try{
            await web.EnsureCoreWebView2Async(await CoreWebView2Environment.CreateAsync(null,Path.Combine(Path.GetDirectoryName(prefsPath)!,"WebView2")));
            web.CoreWebView2.Settings.AreDefaultScriptDialogsEnabled=false;
            web.CoreWebView2.Settings.IsStatusBarEnabled=false;
            web.CoreWebView2.Settings.IsZoomControlEnabled=false;
            web.CoreWebView2.Settings.AreDevToolsEnabled=testing;
            web.CoreWebView2.SetVirtualHostNameToFolderMapping("claro-assets.local",Path.Combine(AppContext.BaseDirectory,"Assets"),CoreWebView2HostResourceAccessKind.Allow);
            web.CoreWebView2.NewWindowRequested+=(_,e)=>{e.Handled=true;HandleLink(e.Uri);};
            web.CoreWebView2.NavigationStarting+=(_,e)=>{
                if(e.Uri.StartsWith("about:blank")||e.Uri.StartsWith("data:"))return;
                e.Cancel=true;HandleLink(e.Uri);
            };
            web.CoreWebView2.WebMessageReceived+=WebMessage;
            ready=true;SetZoom(prefs.Zoom);Render();
        }catch(Exception ex){sourceMode=true;source.Show();web.Hide();SetStatus("Vista previa no disponible. Instalá Microsoft Edge WebView2 Runtime.");if(!testing)MessageBox.Show("No se pudo iniciar WebView2. Podés leer el código Markdown.\n\n"+ex.Message,"Claro MD",MessageBoxButtons.OK,MessageBoxIcon.Information);}
        await NavigateFolder(Directory.Exists(prefs.Folder)?prefs.Folder:Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments),false);
        if(args.Length>0&&!args[0].StartsWith("--")){if(Directory.Exists(args[0]))await NavigateFolder(args[0]);else await OpenFile(args[0]);}
        tree.TopNode=tree.Nodes[0];
        poll.Start();UpdateCommands();ResizeAddress();
        if(testing)await Audit();
    }
    async Task AddShellPlaces(TreeNode quick)
    {
        try{
            var places=await WindowsPlaces.QuickAccess().WaitAsync(TimeSpan.FromSeconds(4));if(IsDisposed)return;
            var more=new TreeNode("Más accesos de Windows"){ImageKey="pin",SelectedImageKey="pin"};
            foreach(var (name,path)in places.Take(20))if(!quick.Nodes.Cast<TreeNode>().Any(n=>SamePath(n.Tag as string??"",path)))more.Nodes.Add(Node(name,path,"pin"));
            if(more.Nodes.Count>0)quick.Nodes.Add(more);tree.TopNode=quick;
        }
        catch{}
    }
    TreeNode Node(string name,string path,string icon="folder")
    {
        var n=new TreeNode(name){Tag=path,ImageKey=icon,SelectedImageKey=icon,ToolTipText=path};
        n.Nodes.Add(new TreeNode("…"){Name="pending"});return n;
    }
    async Task LoadNode(TreeNode node)
    {
        if(node.Nodes.Count!=1||node.Nodes[0].Name!="pending")return;
        node.Nodes[0].Text="Cargando…";
        try{
            var paths=await Task.Run(()=>Directory.GetDirectories((string)node.Tag!).OrderBy(Path.GetFileName,StringComparer.OrdinalIgnoreCase).ToArray());
            if(IsDisposed)return;node.Nodes.Clear();foreach(var p in paths)node.Nodes.Add(Node(Path.GetFileName(p),p));
        }catch(Exception ex)when(ex is IOException or UnauthorizedAccessException){node.Nodes.Clear();node.Nodes.Add(new TreeNode("Sin acceso"){ToolTipText=ex.Message});SetStatus("No se puede acceder a esta carpeta: "+ex.Message);}
    }
    async Task NavigateFolder(string path,bool history=true)
    {
        int version=++folderVersion;UseWaitCursor=true;SetStatus("Cargando carpeta…");
        try{
            path=Path.GetFullPath(Environment.ExpandEnvironmentVariables(path.Trim().Trim('"')));
            var docs=await Task.Run(()=>Directory.EnumerateFiles(path).Where(IsMarkdown).OrderBy(Path.GetFileName,StringComparer.OrdinalIgnoreCase).ToList());
            if(version!=folderVersion||IsDisposed)return;
            if(history&&folder!=""&&!SamePath(folder,path)){back.Push(folder);forward.Clear();}
            folder=path;pathBox.Text=folder;documents=docs;FilterFiles();
            SetStatus($"{documents.Count} {(documents.Count==1?"documento":"documentos")} Markdown · {folder}");
        }catch(Exception ex)when(ex is IOException or UnauthorizedAccessException or ArgumentException or NotSupportedException){if(version==folderVersion){pathBox.Text=folder;SetStatus("No se pudo abrir la carpeta. Revisá la ruta o los permisos: "+ex.Message);}}
        finally{if(version==folderVersion){UseWaitCursor=false;UpdateCommands();}}
    }
    static bool SamePath(string a,string b)=>string.Equals(Path.TrimEndingDirectorySeparator(a),Path.TrimEndingDirectorySeparator(b),StringComparison.OrdinalIgnoreCase);
    static bool IsMarkdown(string p)=>Path.GetExtension(p).Equals(".md",StringComparison.OrdinalIgnoreCase)||Path.GetExtension(p).Equals(".markdown",StringComparison.OrdinalIgnoreCase);
    void FilterFiles()
    {
        filtering=true;files.BeginUpdate();files.Items.Clear();
        foreach(var p in documents.Where(p=>Path.GetFileName(p).Contains(filter.Text,StringComparison.OrdinalIgnoreCase)))files.Items.Add(new Doc(p));
        for(int i=0;i<files.Items.Count;i++)if(SamePath(((Doc)files.Items[i]).Path,current)){files.SelectedIndex=i;break;}
        files.EndUpdate();filtering=false;
        fileCount.Text=$"Documentos   ·   {files.Items.Count}";
        empty.Text=filter.Text==""?"No hay documentos Markdown\n\nAbrí otra carpeta para encontrar tus archivos.":"Sin coincidencias\n\nProbá con otro nombre.";
        empty.Visible=files.Items.Count==0;files.Visible=!empty.Visible;
    }
    async Task OpenFile(string path)
    {
        int version=++fileVersion;
        try{
            path=Path.GetFullPath(path);
            if(!IsMarkdown(path)){SetStatus("Elegí un archivo .md o .markdown.");return;}
            if(new FileInfo(path).Length>20*1024*1024){SetStatus("El archivo supera el límite de 20 MB.");return;}
            var text=await File.ReadAllTextAsync(path);
            if(version!=fileVersion||IsDisposed)return;
            current=path;markdown=text;source.Text=text;lastWrite=File.GetLastWriteTimeUtc(path);deletedWarning=false;
            title.Text=Path.GetFileName(path);subtitle.Text=path;Text=Path.GetFileName(path)+" · Claro MD";
            tips.SetToolTip(title,path);tips.SetToolTip(subtitle,path);Render();UpdateCommands();
            SetStatus($"{text.Split('\n').Length:N0} líneas · {path}");
            var parent=Path.GetDirectoryName(path)!;
            if(!SamePath(parent,folder))await NavigateFolder(parent);else FilterFiles();
        }catch(Exception ex)when(ex is IOException or UnauthorizedAccessException or ArgumentException or NotSupportedException){SetStatus("No se pudo leer el archivo: "+ex.Message);}
    }
    void SetStatus(string text){statusText.Text=text;statusText.ToolTipText=text;}
    void GoUp(){try{var parent=Directory.GetParent(folder);if(parent!=null)_=NavigateFolder(parent.FullName);}catch{}}
    void RefreshAll(){if(folder!="")_=NavigateFolder(folder,false);if(current!="")_=OpenFile(current);}
    void NavigateHistory(Stack<string> from,Stack<string> to){if(from.Count==0)return;to.Push(folder);_=NavigateFolder(from.Pop(),false);}
    void PickFolder(){using var d=new FolderBrowserDialog{InitialDirectory=folder,Description="Elegí una carpeta"};if(d.ShowDialog()==DialogResult.OK)_=NavigateFolder(d.SelectedPath);}
    void PickFile(){using var d=new OpenFileDialog{Filter="Markdown|*.md;*.markdown",InitialDirectory=folder};if(d.ShowDialog()==DialogResult.OK)_=OpenFile(d.FileName);}
    void CopyPath(){if(current!="")Clipboard.SetText(current);}
    void Reveal(){if(current!="")RevealPath(current);}
    void RevealPath(string p){try{Process.Start(new ProcessStartInfo("explorer.exe"){Arguments="/select,\""+p+"\"",UseShellExecute=true});}catch(Exception ex){SetStatus(ex.Message);}}
    void FocusAddress(){pathBox.Focus();pathBox.SelectAll();}
    void SetMode(bool code){sourceMode=code;source.Visible=code||!ready;web.Visible=!code&&ready;UpdateCommands();}
    void ToggleOutline(){reading.Panel2Collapsed=!reading.Panel2Collapsed;if(!reading.Panel2Collapsed)reading.SplitterDistance=Math.Max(reading.Panel1MinSize,reading.Width-(int)(220*DeviceDpi/96f));UpdateCommands();}
    void ToggleTheme(){prefs.Dark=!prefs.Dark;ApplyTheme();Render();}
    void SetZoom(double zoom){prefs.Zoom=Math.Round(Math.Clamp(zoom,.5,2.5),1);zoomLabel.Text=$"{prefs.Zoom*100:0} %";if(ready)web.ZoomFactor=prefs.Zoom;source.ZoomFactor=(float)prefs.Zoom;UpdateCommands();}
    void ShowFind(){findPanel.Show();findText.Focus();findText.SelectAll();}
    async Task Find(bool reverse=false)
    {
        if(findText.Text=="")return;
        bool found;
        if(sourceMode){var start=reverse?Math.Max(0,source.SelectionStart-1):source.SelectionStart+source.SelectionLength;var index=source.Find(findText.Text,start,reverse?RichTextBoxFinds.Reverse:RichTextBoxFinds.None);if(index<0)index=source.Find(findText.Text);found=index>=0;if(found)source.ScrollToCaret();}
        else{if(!ready)return;var result=await web.CoreWebView2.ExecuteScriptAsync($"window.find({JsonSerializer.Serialize(findText.Text)},false,{(reverse?"true":"false")},true)");found=result=="true";}
        findState.Text=found?"Encontrado":"Sin resultado";
    }
    sealed record Doc(string Path){public override string ToString()=>System.IO.Path.GetFileName(Path);}
}
