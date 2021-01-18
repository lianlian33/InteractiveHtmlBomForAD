@echo off

set path=%~dp0

set str=%path:\=\\%
echo var CURRENT_PATH = "%str%";>rootPath.js


copy /b rootPath.js+%path%modules-lite\json2.js+%path%modules-lite\lz-string.js+%path%core\config.js+%path%core\newstroke_font.js+%path%ecad\AD10.js+%path%core\ibom.js+%path%tools\inPcb.js %path%dist\InteractiveHtmlBomForAD.js


rem pause
