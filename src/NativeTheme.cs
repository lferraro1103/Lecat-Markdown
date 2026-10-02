using System.Runtime.InteropServices;
namespace ClaroMD;
static class NativeTheme
{
    [DllImport("dwmapi.dll")] static extern int DwmSetWindowAttribute(IntPtr hwnd,int attribute,ref int value,int size);
    [DllImport("uxtheme.dll",CharSet=CharSet.Unicode)] static extern int SetWindowTheme(IntPtr hwnd,string subApp,string? subId);
    public static void Apply(IntPtr window,IntPtr tree,bool dark)
    {
        int value=dark?1:0;
        try{DwmSetWindowAttribute(window,20,ref value,sizeof(int));SetWindowTheme(tree,dark?"DarkMode_Explorer":"Explorer",null);}catch{}
    }
}
