@echo off
@cd /d %~dp0


@set path=%~dp0

rem set str=%path:\=\\%

@cd .>rootPath.js

@cd .>dist\InteractiveHtmlBomForAD.js
@del dist\InteractiveHtmlBomForAD.jsPreview
@del dist\mainWin.jsPreview
@del config.ini
@rd /s /q History

rem pause