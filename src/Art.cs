using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
namespace ClaroMD;

static class Art
{
    public static Bitmap Glyph(string name, Color color, int size = 24)
    {
        var bmp = new Bitmap(size, size, PixelFormat.Format32bppArgb);
        using var g = Graphics.FromImage(bmp);
        g.SmoothingMode = SmoothingMode.AntiAlias;
        g.ScaleTransform(size / 24f, size / 24f);
        using var p = new Pen(color, 1.7f) { StartCap = LineCap.Round, EndCap = LineCap.Round, LineJoin = LineJoin.Round };
        void L(params PointF[] points) => g.DrawLines(p, points);
        void Line(float a,float b,float c,float d) => g.DrawLine(p,a,b,c,d);
        void Rect(float a,float b,float c,float d) => g.DrawRectangle(p,a,b,c,d);
        switch (name) {
            case "back": L(new(14,5),new(7,12),new(14,19)); Line(7,12,20,12); break;
            case "forward": L(new(10,5),new(17,12),new(10,19)); Line(4,12,17,12); break;
            case "up": L(new(5,11),new(12,4),new(19,11)); Line(12,4,12,20); break;
            case "refresh": g.DrawArc(p,4,4,16,16,40,285); L(new(20,4),new(20,10),new(14,10)); break;
            case "folder": L(new(3,8),new(3,5),new(10,5),new(12,8),new(21,8),new(21,19),new(3,19),new(3,8)); Line(3,10,21,10); break;
            case "drive": Rect(3,8,18,11); Line(6,5,18,5); Line(6,15,6.2f,15); Line(10,15,10.2f,15); break;
            case "document": L(new(14,3),new(5,3),new(5,21),new(19,21),new(19,8),new(14,3),new(14,8),new(19,8)); Line(8,12,16,12); Line(8,16,15,16); break;
            case "download": Line(12,3,12,15); L(new(7,10),new(12,15),new(17,10)); L(new(4,16),new(4,20),new(20,20),new(20,16)); break;
            case "desktop": Rect(3,4,18,13); Line(12,17,12,21); Line(8,21,16,21); break;
            case "image": Rect(3,4,18,16); g.DrawEllipse(p,6,7,3,3); L(new(4,18),new(10,12),new(13,15),new(17,11),new(20,14)); break;
            case "music": L(new(10,17),new(10,6),new(19,3),new(19,15)); g.DrawEllipse(p,4,16,6,4); g.DrawEllipse(p,13,14,6,4); break;
            case "video": Rect(3,6,13,12); L(new(16,10),new(21,7),new(21,17),new(16,14)); break;
            case "search": g.DrawEllipse(p,4,3,12,12); Line(14,14,21,21); break;
            case "code": L(new(8,6),new(3,12),new(8,18)); L(new(16,6),new(21,12),new(16,18)); Line(14,4,10,20); break;
            case "read": L(new(12,6),new(4,4),new(3,4),new(3,19),new(12,21),new(21,19),new(21,4),new(20,4),new(12,6),new(12,21)); break;
            case "list": for(int y=6;y<=18;y+=6) { Line(8,y,21,y); Line(3,y,3.1f,y); } break;
            case "sun": g.DrawEllipse(p,7,7,10,10); for(int i=0;i<8;i++) {var a=i*Math.PI/4; Line(12+(float)Math.Cos(a)*8,12+(float)Math.Sin(a)*8,12+(float)Math.Cos(a)*10,12+(float)Math.Sin(a)*10);} break;
            case "moon": g.DrawArc(p,4,3,17,18,55,285); g.DrawArc(p,10,0,14,15,75,160); break;
            case "plus": Line(12,5,12,19); Line(5,12,19,12); break;
            case "minus": Line(5,12,19,12); break;
            case "copy": Rect(8,7,12,14); L(new(15,7),new(15,3),new(4,3),new(4,16),new(8,16)); break;
            case "close": Line(6,6,18,18); Line(6,18,18,6); break;
            case "sidebar": Rect(3,4,18,16); Line(10,4,10,20); break;
            case "info": g.DrawEllipse(p,3,3,18,18); Line(12,10,12,17); Line(12,7,12.1f,7); break;
            case "pin": L(new(8,3),new(16,3),new(15,10),new(18,14),new(6,14),new(9,10),new(8,3)); Line(12,14,12,21); break;
            default: Rect(5,5,14,14); break;
        }
        return bmp;
    }
    public static GraphicsPath Rounded(RectangleF r, float radius)
    {
        var p = new GraphicsPath(); var d=radius*2;
        p.AddArc(r.X,r.Y,d,d,180,90); p.AddArc(r.Right-d,r.Y,d,d,270,90);
        p.AddArc(r.Right-d,r.Bottom-d,d,d,0,90); p.AddArc(r.X,r.Bottom-d,d,d,90,90); p.CloseFigure(); return p;
    }
    public static Bitmap Logo(int size)
    {
        var bmp=new Bitmap(size,size,PixelFormat.Format32bppArgb);
        using var g=Graphics.FromImage(bmp); g.SmoothingMode=SmoothingMode.AntiAlias; g.ScaleTransform(size/256f,size/256f);
        using var path=Rounded(new RectangleF(12,12,232,232),52);
        using var gradient=new LinearGradientBrush(new Rectangle(12,12,232,232),Color.FromArgb(61,131,246),Color.FromArgb(32,66,177),65f);
        g.FillPath(gradient,path);
        using var shadow=new SolidBrush(Color.FromArgb(45,0,18,65));
        using var docShadow=Rounded(new RectangleF(68,49,137,174),13); g.FillPath(shadow,docShadow);
        using var paper=new SolidBrush(Color.FromArgb(250,253,255));
        using var doc=new GraphicsPath();
        doc.AddLines(new PointF[]{new(65,38),new(157,38),new(193,74),new(193,205),new(65,205)}); doc.CloseFigure(); g.FillPath(paper,doc);
        using var fold=new SolidBrush(Color.FromArgb(186,213,255)); g.FillPolygon(fold,new PointF[]{new(157,38),new(157,74),new(193,74)});
        using var p=new Pen(Color.FromArgb(40,95,202),11){LineJoin=LineJoin.Round,StartCap=LineCap.Round,EndCap=LineCap.Round};
        g.DrawLines(p,new PointF[]{new(86,139),new(86,100),new(110,124),new(134,100),new(134,139)});
        g.DrawLine(p,159,104,159,137); g.DrawLines(p,new PointF[]{new(147,126),new(159,139),new(171,126)});
        using var line=new Pen(Color.FromArgb(172,195,228),7){StartCap=LineCap.Round,EndCap=LineCap.Round}; g.DrawLine(line,87,167,168,167);
        return bmp;
    }
    public static void CreateAssets(string directory)
    {
        Directory.CreateDirectory(directory);
        int[] sizes={16,20,24,32,40,48,64,128,256};
        var pngs=new List<byte[]>();
        foreach(var size in sizes) { using var bmp=Logo(size); using var stream=new MemoryStream(); bmp.Save(stream,ImageFormat.Png); pngs.Add(stream.ToArray()); if(size==256) bmp.Save(Path.Combine(directory,"ClaroMD.png"),ImageFormat.Png); }
        using var file=File.Create(Path.Combine(directory,"ClaroMD.ico")); using var w=new BinaryWriter(file);
        w.Write((ushort)0); w.Write((ushort)1); w.Write((ushort)sizes.Length); int offset=6+16*sizes.Length;
        for(int i=0;i<sizes.Length;i++){w.Write((byte)(sizes[i]==256?0:sizes[i]));w.Write((byte)(sizes[i]==256?0:sizes[i]));w.Write((byte)0);w.Write((byte)0);w.Write((ushort)1);w.Write((ushort)32);w.Write(pngs[i].Length);w.Write(offset);offset+=pngs[i].Length;}
        foreach(var bytes in pngs) w.Write(bytes);
    }
}
sealed record Palette(Color Shell,Color Panel,Color Canvas,Color Text,Color Muted,Color Accent,Color Selection,Color Border)
{
    static Color C(string s)=>ColorTranslator.FromHtml(s);
    public static Palette For(bool dark)=>dark
        ?new(C("#161B22"),C("#1C232D"),C("#11161D"),C("#E4EBF5"),C("#A8B6C8"),C("#8BB5FF"),C("#293D5C"),C("#34404F"))
        :new(C("#F5F7FA"),C("#F8FAFC"),C("#FFFFFF"),C("#243044"),C("#586579"),C("#2563EB"),C("#E8F0FF"),C("#D5DDE8"));
}
sealed class BarRenderer(Func<Palette> getPalette) : ToolStripProfessionalRenderer
{
    protected override void OnRenderToolStripBackground(ToolStripRenderEventArgs e) {e.Graphics.Clear(getPalette().Shell);}
    protected override void OnRenderToolStripBorder(ToolStripRenderEventArgs e) {using var p=new Pen(getPalette().Border);e.Graphics.DrawLine(p,0,e.ToolStrip.Height-1,e.ToolStrip.Width,e.ToolStrip.Height-1);}
    protected override void OnRenderButtonBackground(ToolStripItemRenderEventArgs e)
    {
        var palette=getPalette(); var b=e.Item as ToolStripButton;
        if(e.Item.Selected || b?.Checked==true) {using var brush=new SolidBrush(palette.Selection);using var path=Art.Rounded(new RectangleF(1,3,e.Item.Width-2,e.Item.Height-6),6);e.Graphics.FillPath(brush,path);}
        if(b?.Checked==true) {using var pen=new Pen(palette.Accent,2);e.Graphics.DrawLine(pen,8,e.Item.Height-3,e.Item.Width-8,e.Item.Height-3);}
    }
    protected override void OnRenderMenuItemBackground(ToolStripItemRenderEventArgs e)
    {
        var p=getPalette();using var b=new SolidBrush(e.Item.Selected ? p.Selection:p.Shell);e.Graphics.FillRectangle(b,new Rectangle(Point.Empty,e.Item.Size));
    }
    protected override void OnRenderImageMargin(ToolStripRenderEventArgs e) {using var b=new SolidBrush(getPalette().Shell);e.Graphics.FillRectangle(b,e.AffectedBounds);}
    protected override void OnRenderItemText(ToolStripItemTextRenderEventArgs e) {e.TextColor=e.Item.Enabled?getPalette().Text:getPalette().Muted;base.OnRenderItemText(e);}
    protected override void OnRenderSeparator(ToolStripSeparatorRenderEventArgs e) {using var p=new Pen(getPalette().Border);if(e.Vertical)e.Graphics.DrawLine(p,e.Item.Width/2,10,e.Item.Width/2,e.Item.Height-10);else e.Graphics.DrawLine(p,8,3,e.Item.Width-8,3);}
}
