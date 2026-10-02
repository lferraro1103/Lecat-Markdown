namespace ClaroMD;
sealed partial class Reader
{
    void BuildLayout()
    {
        bars.AddRange(new ToolStrip[]{navigation,documentTools,menu,status});
        var brand=new Panel{Dock=DockStyle.Top,Height=56,Padding=new Padding(16,10,8,10)};
        var logo=new PictureBox{Dock=DockStyle.Left,Width=36,Image=Art.Logo(64),SizeMode=PictureBoxSizeMode.Zoom};
        var label=new Label{Dock=DockStyle.Fill,Text="  Claro MD",TextAlign=ContentAlignment.MiddleLeft,Font=new Font("Segoe UI Semibold",15)};
        brand.Controls.Add(label);brand.Controls.Add(logo);
        tree.AccessibleName="Acceso rápido y unidades de Windows";
        sidebar.Panel1.Controls.Add(tree);sidebar.Panel1.Controls.Add(brand);
        var listPanel=new Panel{Dock=DockStyle.Fill,Padding=new Padding(12,4,12,12)};
        listPanel.Controls.Add(files);listPanel.Controls.Add(empty);
        var filterPanel=new Panel{Dock=DockStyle.Top,Height=40,Padding=new Padding(0,2,0,10)};
        filterPanel.Controls.Add(filter);listPanel.Controls.Add(filterPanel);
        sidebar.Panel2.Controls.Add(listPanel);sidebar.Panel2.Controls.Add(fileCount);
        outer.Panel1.Controls.Add(sidebar);
        preview.Controls.Add(web);preview.Controls.Add(source);source.Hide();
        reading.Panel1.Controls.Add(preview);reading.Panel2.Controls.Add(outline);
        reading.Panel2.Controls.Add(new Label{Dock=DockStyle.Top,Height=40,Text="En este documento",Padding=new Padding(12,10,0,0),Font=new Font("Segoe UI Semibold",10)});
        outer.Panel2.Controls.Add(reading);
        findPanel.Controls.Add(findText);findPanel.Controls.Add(findState);
        var close=new Button{Dock=DockStyle.Right,Width=32,Text="×",FlatStyle=FlatStyle.Flat,AccessibleName="Cerrar búsqueda"};
        close.FlatAppearance.BorderSize=0;close.Click+=(_,_)=>findPanel.Hide();findPanel.Controls.Add(close);
        outer.Panel2.Controls.Add(findPanel);outer.Panel2.Controls.Add(documentTools);
        var headerText=new Panel{Dock=DockStyle.Fill};headerText.Controls.Add(subtitle);headerText.Controls.Add(title);
        var docIcon=new PictureBox{Dock=DockStyle.Left,Width=44,SizeMode=PictureBoxSizeMode.CenterImage,Tag="document"};
        docHeader.Controls.Add(headerText);docHeader.Controls.Add(docIcon);
        outer.Panel2.Controls.Add(docHeader);
        status.Items.Add(statusText);status.Items.Add(renderBadge);
        Controls.Add(outer);Controls.Add(status);Controls.Add(navigation);Controls.Add(menu);MainMenuStrip=menu;
        tree.DrawNode+=DrawTree;files.DrawItem+=DrawFile;
        navigation.SizeChanged+=(_,_)=>ResizeAddress();
        tree.ContextMenuStrip=ContextMenu(false);files.ContextMenuStrip=ContextMenu(true);
    }
    ToolStripButton Button(ToolStrip bar,string key,string text,string icon,string tooltip,Action action,bool document=false)
    {
        var b=new ToolStripButton(text){Name=key,Tag=icon,ToolTipText=tooltip,AccessibleName=tooltip,AutoSize=true,Padding=new Padding(6),DisplayStyle=text==""?ToolStripItemDisplayStyle.Image:ToolStripItemDisplayStyle.ImageAndText,ImageScaling=ToolStripItemImageScaling.SizeToFit,Margin=new Padding(2,0,2,0)};
        b.Click+=(_,_)=>action();bar.Items.Add(b);buttons[key]=b;if(document)requiresDocument.Add(b);return b;
    }
    ToolStripMenuItem Item(ToolStripMenuItem parent,string text,string icon,Action action,Keys shortcut=Keys.None,bool document=false)
    {
        var item=new ToolStripMenuItem(text){Tag=icon,ShortcutKeys=shortcut,AccessibleName=text};item.Click+=(_,_)=>action();parent.DropDownItems.Add(item);if(document)requiresDocument.Add(item);return item;
    }
    void BuildCommands()
    {
        Button(navigation,"back","","back","Atrás · Alt+Izquierda",()=>NavigateHistory(back,forward));
        Button(navigation,"forward","","forward","Adelante · Alt+Derecha",()=>NavigateHistory(forward,back));
        Button(navigation,"up","","up","Subir una carpeta · Alt+Arriba",GoUp);
        navigation.Items.Add(new ToolStripSeparator());pathBox.BorderStyle=BorderStyle.FixedSingle;pathBox.Font=Font;navigation.Items.Add(pathBox);
        Button(navigation,"refresh","","refresh","Actualizar · F5",RefreshAll);
        navigation.Items.Add(new ToolStripSeparator());
        Button(navigation,"folder","Carpeta","folder","Abrir carpeta · Ctrl+Mayús+O",PickFolder);
        Button(navigation,"open","Abrir Markdown","document","Abrir Markdown · Ctrl+O",PickFile);
        Button(documentTools,"read","Lectura","read","Vista de lectura · Ctrl+1",()=>SetMode(false));
        Button(documentTools,"code","Código","code","Código Markdown · Ctrl+2",()=>SetMode(true));
        documentTools.Items.Add(new ToolStripSeparator());
        Button(documentTools,"outline","Índice","list","Índice de encabezados · Ctrl+Mayús+I",ToggleOutline);
        Button(documentTools,"find","","search","Buscar texto · Ctrl+F",ShowFind,true);
        documentTools.Items.Add(new ToolStripSeparator());
        Button(documentTools,"minus","","minus","Reducir tamaño · Ctrl+-",()=>SetZoom(prefs.Zoom-.1));documentTools.Items.Add(zoomLabel);
        Button(documentTools,"plus","","plus","Aumentar tamaño · Ctrl++",()=>SetZoom(prefs.Zoom+.1));
        Button(documentTools,"theme","Tema","moon","Cambiar tema claro/oscuro · Ctrl+T",ToggleTheme).Alignment=ToolStripItemAlignment.Right;
        var file=new ToolStripMenuItem("&Archivo");var nav=new ToolStripMenuItem("&Navegación");var view=new ToolStripMenuItem("&Vista");var help=new ToolStripMenuItem("A&yuda");
        menu.Items.AddRange(new ToolStripItem[]{file,nav,view,help});
        Item(file,"Abrir &Markdown…","document",PickFile,Keys.Control|Keys.O);
        Item(file,"Abrir &carpeta…","folder",PickFolder,Keys.Control|Keys.Shift|Keys.O);
        file.DropDownItems.Add(new ToolStripSeparator());
        Item(file,"&Copiar ruta del documento","copy",CopyPath,Keys.Control|Keys.Shift|Keys.C,true);
        Item(file,"Mostrar en el &Explorador","folder",Reveal,Keys.None,true);
        file.DropDownItems.Add(new ToolStripSeparator());Item(file,"&Salir","close",Close,Keys.Alt|Keys.F4);
        Item(nav,"&Atrás","back",()=>NavigateHistory(back,forward),Keys.Alt|Keys.Left).Name="menuBack";
        Item(nav,"A&delante","forward",()=>NavigateHistory(forward,back),Keys.Alt|Keys.Right).Name="menuForward";
        Item(nav,"&Subir","up",GoUp,Keys.Alt|Keys.Up).Name="menuUp";
        Item(nav,"&Actualizar","refresh",RefreshAll,Keys.F5);
        Item(nav,"&Ir a una ruta","folder",FocusAddress,Keys.Control|Keys.L);
        Item(view,"&Lectura","read",()=>SetMode(false),Keys.Control|Keys.D1).Name="modeRead";
        Item(view,"&Código Markdown","code",()=>SetMode(true),Keys.Control|Keys.D2).Name="modeCode";
        Item(view,"&Índice de encabezados","list",ToggleOutline,Keys.Control|Keys.Shift|Keys.I).Name="menuOutline";
        Item(view,"Mostrar / ocultar &biblioteca","sidebar",()=>{outer.Panel1Collapsed=!outer.Panel1Collapsed;},Keys.Control|Keys.B);
        Item(view,"&Buscar texto","search",ShowFind,Keys.Control|Keys.F,true);
        view.DropDownItems.Add(new ToolStripSeparator());
        Item(view,"&Aumentar tamaño","plus",()=>SetZoom(prefs.Zoom+.1),Keys.Control|Keys.Oemplus);
        Item(view,"&Reducir tamaño","minus",()=>SetZoom(prefs.Zoom-.1),Keys.Control|Keys.OemMinus);
        Item(view,"Tamaño &original","read",()=>SetZoom(1),Keys.Control|Keys.D0);
        view.DropDownItems.Add(new ToolStripSeparator());
        Item(view,"Cambiar &tema","moon",ToggleTheme,Keys.Control|Keys.T);
        Item(view,"Permitir imágenes &remotas","image",()=>{prefs.RemoteImages=!prefs.RemoteImages;UpdateCommands();Render();}).Name="remoteImages";
        Item(help,"&Atajos de teclado","code",()=>MessageBox.Show("Ctrl+O · Abrir Markdown\nCtrl+Mayús+O · Abrir carpeta\nCtrl+L · Ir a ruta\nAlt+← / → / ↑ · Navegar\nF5 · Actualizar\nCtrl+1 / Ctrl+2 · Lectura / código\nCtrl+F · Buscar\nCtrl+B · Mostrar / ocultar biblioteca\nCtrl+Mayús+I · Índice\nCtrl++ / Ctrl+- / Ctrl+0 · Tamaño\nCtrl+T · Tema","Atajos · Claro MD",MessageBoxButtons.OK,MessageBoxIcon.Information));
        Item(help,"&Acerca de Claro MD","info",()=>MessageBox.Show("Claro MD 2.0\nLector Markdown para Windows.\n\nDiagramas Mermaid, matemáticas KaTeX y código resaltado, sin conexión.\n\nLos documentos se abren en modo de solo lectura.","Claro MD",MessageBoxButtons.OK,MessageBoxIcon.Information));
    }
    ContextMenuStrip ContextMenu(bool document)
    {
        var context=new ContextMenuStrip();bars.Add(context);
        void Add(string text,string icon,Action action){var i=new ToolStripMenuItem(text){Tag=icon};i.Click+=(_,_)=>action();context.Items.Add(i);}
        if(document){Add("Abrir documento","read",()=>{if(files.SelectedItem is Doc d)_=OpenFile(d.Path);});Add("Copiar ruta","copy",()=>{if(files.SelectedItem is Doc d)Clipboard.SetText(d.Path);});Add("Mostrar en Explorador","folder",()=>{if(files.SelectedItem is Doc d)RevealPath(d.Path);});}
        else{Add("Abrir carpeta","folder",()=>{if(tree.SelectedNode?.Tag is string p)_=NavigateFolder(p);});Add("Copiar ruta","copy",()=>{if(tree.SelectedNode?.Tag is string p)Clipboard.SetText(p);});Add("Actualizar","refresh",RefreshAll);}
        return context;
    }
    IEnumerable<ToolStripItem> AllItems(ToolStrip strip)
    {
        foreach(ToolStripItem i in strip.Items){yield return i;if(i is ToolStripDropDownItem drop)foreach(var child in ChildItems(drop))yield return child;}
    }
    IEnumerable<ToolStripItem> ChildItems(ToolStripDropDownItem parent)
    {
        foreach(ToolStripItem i in parent.DropDownItems){yield return i;if(i is ToolStripDropDownItem d)foreach(var child in ChildItems(d))yield return child;}
    }
    void UpdateCommands()
    {
        if(buttons.Count==0)return;
        buttons["back"].Enabled=back.Count>0;buttons["forward"].Enabled=forward.Count>0;
        buttons["up"].Enabled=folder!=""&&Directory.GetParent(folder)!=null;
        buttons["read"].Checked=!sourceMode;buttons["code"].Checked=sourceMode;
        buttons["outline"].Checked=!reading.Panel2Collapsed;buttons["minus"].Enabled=prefs.Zoom>.5;buttons["plus"].Enabled=prefs.Zoom<2.5;
        foreach(var i in requiresDocument)i.Enabled=current!="";
        foreach(var i in AllItems(menu)){switch(i.Name){case "menuBack":i.Enabled=back.Count>0;break;case "menuForward":i.Enabled=forward.Count>0;break;case "menuUp":i.Enabled=buttons["up"].Enabled;break;case "remoteImages":((ToolStripMenuItem)i).Checked=prefs.RemoteImages;break;case "modeRead":((ToolStripMenuItem)i).Checked=!sourceMode;break;case "modeCode":((ToolStripMenuItem)i).Checked=sourceMode;break;case "menuOutline":((ToolStripMenuItem)i).Checked=!reading.Panel2Collapsed;break;}}
    }
    void ResizeAddress()
    {
        int used=navigation.Items.Cast<ToolStripItem>().Where(i=>i!=pathBox&&i is not ToolStripSeparator).Sum(i=>i.Width+i.Margin.Horizontal);
        pathBox.Width=Math.Max(180,navigation.ClientSize.Width-used-navigation.Padding.Horizontal-60);
        pathBox.Overflow=ToolStripItemOverflow.Never;
    }
    void ApplyTheme()
    {
        colors=Palette.For(prefs.Dark);
        void Paint(Control c){c.BackColor=colors.Shell;c.ForeColor=colors.Text;foreach(Control child in c.Controls)Paint(child);}
        Paint(this);tree.BackColor=colors.Panel;files.BackColor=colors.Panel;empty.BackColor=colors.Panel;outline.BackColor=colors.Panel;
        source.BackColor=colors.Canvas;source.ForeColor=colors.Text;subtitle.ForeColor=colors.Muted;empty.ForeColor=colors.Muted;
        filter.BackColor=colors.Canvas;pathBox.BackColor=colors.Canvas;findText.BackColor=colors.Canvas;
        var renderer=new BarRenderer(()=>colors);int iconSize=(int)(20*DeviceDpi/96f);
        files.ItemHeight=(int)(48*DeviceDpi/96f);tree.ItemHeight=(int)(32*DeviceDpi/96f);
        foreach(var bar in bars){bar.Renderer=renderer;bar.Font=Font;bar.ImageScalingSize=new Size(iconSize,iconSize);foreach(var item in AllItems(bar)){item.BackColor=colors.Shell;item.ForeColor=colors.Text;if(item.Tag is string key){var previous=item.Image;item.Image=Art.Glyph(key,colors.Text,iconSize);previous?.Dispose();}}}
        var images=new ImageList{ImageSize=new Size(iconSize,iconSize),ColorDepth=ColorDepth.Depth32Bit};
        foreach(var key in new[]{"folder","drive","document","desktop","download","image","music","video","pin"})images.Images.Add(key,Art.Glyph(key,key=="folder"?Color.FromArgb(193,139,47):colors.Muted,iconSize));
        var old=tree.ImageList;tree.ImageList=images;old?.Dispose();
        foreach(Control c in docHeader.Controls)if(c is PictureBox pic&&pic.Tag is string k){pic.Image?.Dispose();pic.Image=Art.Glyph(k,colors.Accent,(int)(28*DeviceDpi/96f));}
        if(ready)web.DefaultBackgroundColor=colors.Canvas;
        if(buttons.TryGetValue("theme",out var theme)){theme.Tag=prefs.Dark?"sun":"moon";theme.Image?.Dispose();theme.Image=Art.Glyph((string)theme.Tag,colors.Text,iconSize);}
        tree.Invalidate();files.Invalidate();Invalidate(true);
        NativeTheme.Apply(Handle,tree.Handle,prefs.Dark);
    }
    void DrawTree(object? sender,DrawTreeNodeEventArgs e)
    {
        if(e.Node==null)return;
        if(e.Node.Tag!=null||e.Node.Parent!=null){e.DrawDefault=true;return;}
        using var bg=new SolidBrush(colors.Panel);e.Graphics.FillRectangle(bg,new Rectangle(0,e.Bounds.Top,tree.Width,e.Bounds.Height));
        if(e.Node.Name=="drives"){using var p=new Pen(colors.Border);e.Graphics.DrawLine(p,12,e.Bounds.Top,tree.Width-12,e.Bounds.Top);}
        using var font=new Font("Segoe UI Semibold",9.5f);
        TextRenderer.DrawText(e.Graphics,e.Node.Text,font,new Rectangle(12,e.Bounds.Top+4,tree.Width-24,e.Bounds.Height-4),colors.Muted,TextFormatFlags.VerticalCenter|TextFormatFlags.EndEllipsis);
    }
    void DrawFile(object? sender,DrawItemEventArgs e)
    {
        if(e.Index<0)return;
        var doc=(Doc)files.Items[e.Index];bool selected=(e.State&DrawItemState.Selected)!=0;
        using var brush=new SolidBrush(selected?colors.Selection:colors.Panel);e.Graphics.FillRectangle(brush,e.Bounds);
        int sz=(int)(22*DeviceDpi/96f);using var icon=Art.Glyph("document",selected?colors.Accent:colors.Muted,sz);
        e.Graphics.DrawImage(icon,e.Bounds.X+4,e.Bounds.Y+(e.Bounds.Height-sz)/2);
        int left=e.Bounds.X+sz+14;
        TextRenderer.DrawText(e.Graphics,Path.GetFileName(doc.Path),Font,new Rectangle(left,e.Bounds.Y+4,e.Bounds.Width-left-4,24),colors.Text,TextFormatFlags.EndEllipsis|TextFormatFlags.VerticalCenter);
        string meta="Markdown";try{meta+=" · "+FormatSize(new FileInfo(doc.Path).Length);}catch{}
        using var font=new Font("Segoe UI",9);
        TextRenderer.DrawText(e.Graphics,meta,font,new Rectangle(left,e.Bounds.Y+27,e.Bounds.Width-left-4,18),colors.Muted,TextFormatFlags.EndEllipsis);
        if((e.State&DrawItemState.Focus)!=0)e.DrawFocusRectangle();
    }
    static string FormatSize(long bytes)=>bytes<1024?$"{bytes} B":bytes<1024*1024?$"{bytes/1024d:0.#} KB":$"{bytes/1048576d:0.#} MB";
}
