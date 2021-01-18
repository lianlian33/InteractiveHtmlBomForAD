@echo off
cd /d %~dp0


set path=%~dp0

rem set str=%path:\=\\%

cd .>rootPath.js

cd .>%path%dist\InteractiveHtmlBomForAD.js
del %path%dist\InteractiveHtmlBomForAD.jsPreview
rd /s /q History

rem pause