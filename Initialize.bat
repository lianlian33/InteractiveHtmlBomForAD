@echo off

@set path=%~dp0
@cd /d %~dp0
@set str=%path:\=\\%
@echo var CURRENT_PATH = "%str%";>rootPath.js

@copy /b rootPath.js+modules-lite\json2.js+modules-lite\lz-string.js+core\config.js+core\newstroke_font.js+ecad\AD10.js+core\ibom.js+tools\inPcb.js dist\InteractiveHtmlBomForAD.js

@rem pause
