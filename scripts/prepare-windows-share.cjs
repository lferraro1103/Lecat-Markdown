const fs=require('node:fs/promises'),path=require('node:path'),{execFileSync}=require('node:child_process');
async function prepare(){
 if(process.platform!=='win32')throw Error('Windows Share requires Windows');
 const root=path.resolve('.cache/windows-share'),output=path.join(root,'LecatShare.exe');await fs.mkdir(root,{recursive:true});
 const vswhere=path.join(process.env['ProgramFiles(x86)']||'C:/Program Files (x86)','Microsoft Visual Studio/Installer/vswhere.exe');
 const installation=execFileSync(vswhere,['-latest','-products','*','-requires','Microsoft.VisualStudio.Component.VC.Tools.x86.x64','-property','installationPath'],{encoding:'utf8',windowsHide:true}).trim();
 if(!installation)throw Error('Install the Visual Studio C++ desktop build tools and Windows SDK to compile Windows Share.');
 const script=path.join(root,'build.cmd'),quote=value=>'"'+value+'"';
 await fs.writeFile(script,'@echo off\r\ncall '+quote(path.join(installation,'Common7/Tools/VsDevCmd.bat'))+' -arch=x64 -host_arch=x64 >nul\r\nif errorlevel 1 exit /b %errorlevel%\r\ncl.exe /nologo /std:c++20 /EHsc /W4 /MT /DUNICODE /D_UNICODE '+quote(path.resolve('native/windows-share.cpp'))+' /Fo'+quote(path.join(root,'windows-share.obj'))+' /Fe'+quote(output)+' /link /SUBSYSTEM:WINDOWS windowsapp.lib user32.lib shell32.lib\r\nexit /b %errorlevel%\r\n');
 execFileSync(process.env.ComSpec||'cmd.exe',['/d','/c',path.relative(process.cwd(),script)],{stdio:'inherit',windowsHide:true});
 return output;
}
exports.prepare=prepare;if(require.main===module)prepare().then(file=>console.log(file)).catch(error=>{console.error(error);process.exitCode=1;});
