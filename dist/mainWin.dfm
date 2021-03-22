object mainWin: TmainWin
  Left = 109
  Top = 6
  Cursor = crArrow
  Caption = 'InteractiveHtmlBom v0.3'
  ClientHeight = 452
  ClientWidth = 452
  Color = clBtnFace
  Font.Charset = DEFAULT_CHARSET
  Font.Color = clWindowText
  Font.Height = -11
  Font.Name = 'Tahoma'
  Font.Style = []
  OldCreateOrder = False
  Scaled = False
  OnShow = mainWinShow
  FormKind = fkNormal
  PixelsPerInch = 96
  TextHeight = 13
  object PageControl1: TPageControl
    Left = 8
    Top = 8
    Width = 440
    Height = 440
    ActivePage = TabSheet1
    TabOrder = 0
    object TabSheet1: TTabSheet
      Caption = 'General'
      object GroupBox1: TGroupBox
        Left = 7
        Top = 9
        Width = 413
        Height = 63
        Caption = 'Bom destination'
        TabOrder = 0
        object BtnSave: TButton
          Left = 373
          Top = 22
          Width = 32
          Height = 26
          Caption = '...'
          TabOrder = 0
          OnClick = BtnSaveClick
        end
        object TEditCurrentPcbPath: TEdit
          Left = 61
          Top = 24
          Width = 304
          Height = 21
          ReadOnly = True
          TabOrder = 1
        end
      end
      object StaticText1: TStaticText
        Left = 18
        Top = 37
        Width = 48
        Height = 17
        Caption = 'Directory'
        TabOrder = 1
      end
      object GroupBox3: TGroupBox
        Left = 7
        Top = 81
        Width = 413
        Height = 95
        Caption = 'Additional pcb data'
        TabOrder = 2
        object CbIncludeTracksAndSolidPolygons: TCheckBox
          Left = 14
          Top = 31
          Width = 167
          Height = 17
          Caption = 'Include tracks/solid polygons'
          TabOrder = 0
        end
        object CbIncludeVias: TCheckBox
          Left = 14
          Top = 63
          Width = 87
          Height = 17
          Caption = 'Include vias'
          TabOrder = 1
        end
        object CbIncludeHatched: TCheckBox
          Left = 206
          Top = 31
          Width = 167
          Height = 17
          Caption = 'Include hatched'
          Enabled = False
          TabOrder = 2
        end
        object CbIncludeNets: TCheckBox
          Left = 206
          Top = 63
          Width = 87
          Height = 17
          Caption = 'Include nets'
          Enabled = False
          TabOrder = 3
        end
      end
      object GroupBox4: TGroupBox
        Left = 7
        Top = 185
        Width = 413
        Height = 167
        Caption = 'Component blacklist '
        TabOrder = 3
        object CbBlacklistDNP: TCheckBox
          Left = 14
          Top = 35
          Width = 183
          Height = 17
          Caption = 'Component with "DNP" comment '
          Checked = True
          Enabled = False
          State = cbChecked
          TabOrder = 0
        end
        object CbBlacklist1Pad: TCheckBox
          Left = 222
          Top = 35
          Width = 135
          Height = 17
          Caption = 'Component with 1 pad'
          Checked = True
          Enabled = False
          State = cbChecked
          TabOrder = 1
        end
      end
      object GenerateBom: TButton
        Left = 336
        Top = 371
        Width = 80
        Height = 25
        Caption = 'GenerateBom'
        TabOrder = 4
        OnClick = GenerateBomClick
      end
    end
    object TabSheet2: TTabSheet
      Caption = 'Html defaults'
      ExplicitLeft = 0
      ExplicitTop = 0
      ExplicitWidth = 0
      ExplicitHeight = 0
      object CbDarkMode: TCheckBox
        Left = 14
        Top = 15
        Width = 87
        Height = 17
        Caption = 'Dark mode'
        TabOrder = 0
      end
      object CbShowFootprintPads: TCheckBox
        Left = 126
        Top = 15
        Width = 118
        Height = 17
        Caption = 'Show footprint pads'
        Checked = True
        State = cbChecked
        TabOrder = 1
      end
      object CbShowFabricationLayer: TCheckBox
        Left = 262
        Top = 15
        Width = 134
        Height = 17
        Caption = 'Show fabrication layer'
        TabOrder = 2
      end
      object CbShowSilkscreen: TCheckBox
        Left = 14
        Top = 47
        Width = 94
        Height = 17
        Caption = 'Show silkscreen'
        Checked = True
        State = cbChecked
        TabOrder = 3
      end
      object CbHighlightFirstPin: TCheckBox
        Left = 126
        Top = 47
        Width = 102
        Height = 17
        Caption = 'Highlight first pin'
        TabOrder = 4
      end
      object CbContinuousRedrawOnDrag: TCheckBox
        Left = 262
        Top = 47
        Width = 158
        Height = 17
        Caption = 'Continuous redraw on drag'
        Checked = True
        State = cbChecked
        TabOrder = 5
      end
      object TTrackBarRotation: TXPTrackBar
        Left = 8
        Top = 95
        Width = 415
        Height = 20
        Max = 72
        Position = 36
        SelEnd = 0
        SelStart = 0
        TabOrder = 6
        OnChange = TTrackBarRotationChange
      end
      object GroupBox5: TGroupBox
        Left = 7
        Top = 121
        Width = 413
        Height = 58
        Caption = 'Checkboxes'
        TabOrder = 7
        object TEditHtmlCheckboxes: TEdit
          Left = 13
          Top = 24
          Width = 304
          Height = 21
          TabOrder = 0
          Text = 'Sourced,Placed'
        end
      end
      object StaticText2: TStaticText
        Left = 16
        Top = 77
        Width = 73
        Height = 17
        Caption = 'Board rotation'
        TabOrder = 8
      end
      object TTextRotation: TStaticText
        Left = 130
        Top = 77
        Width = 15
        Height = 17
        Caption = '0'#176
        TabOrder = 9
      end
      object GroupBox6: TGroupBox
        Left = 7
        Top = 193
        Width = 413
        Height = 58
        Caption = 'BOM View'
        TabOrder = 10
        object RBtnBomOnly: TRadioButton
          Left = 14
          Top = 28
          Width = 113
          Height = 17
          Caption = 'BOM only'
          TabOrder = 0
        end
        object RBtnBomLeftDrawingRight: TRadioButton
          Left = 110
          Top = 28
          Width = 135
          Height = 17
          Caption = 'BOM left, drawings right'
          Checked = True
          TabOrder = 1
          TabStop = True
        end
        object RBtnBomTopDrawingBottom: TRadioButton
          Left = 254
          Top = 28
          Width = 151
          Height = 17
          Caption = 'BOM top, drawings bottom'
          TabOrder = 2
        end
      end
      object GroupBox7: TGroupBox
        Left = 7
        Top = 265
        Width = 413
        Height = 58
        Caption = 'Layer View'
        TabOrder = 11
        object RBtnFrontAndBack: TRadioButton
          Left = 110
          Top = 28
          Width = 113
          Height = 17
          Caption = 'Front and Back'
          Checked = True
          TabOrder = 0
          TabStop = True
        end
        object RBtnFrontOnly: TRadioButton
          Left = 14
          Top = 28
          Width = 79
          Height = 17
          Caption = 'Front only'
          TabOrder = 1
        end
        object RBtnBackOnly: TRadioButton
          Left = 254
          Top = 28
          Width = 113
          Height = 17
          Caption = 'Back only'
          TabOrder = 2
        end
      end
      object GroupBox8: TGroupBox
        Left = 7
        Top = 337
        Width = 413
        Height = 58
        Caption = 'Other'
        TabOrder = 12
        object CbOpenBrowser: TCheckBox
          Left = 14
          Top = 25
          Width = 94
          Height = 17
          Caption = 'Open browser'
          Enabled = False
          TabOrder = 0
        end
        object CbOpenExplorer: TCheckBox
          Left = 118
          Top = 25
          Width = 94
          Height = 17
          Caption = 'Open explorer'
          Checked = True
          Enabled = False
          State = cbChecked
          TabOrder = 1
        end
      end
    end
    object TabSheet3: TTabSheet
      Caption = 'Extra fields'
      object GroupBox2: TGroupBox
        Left = 7
        Top = 9
        Width = 413
        Height = 63
        Caption = 'Extra file (not implemeted)'
        TabOrder = 0
        object TEditExtraFileName: TEdit
          Left = 13
          Top = 24
          Width = 352
          Height = 21
          HelpType = htKeyword
          ReadOnly = True
          TabOrder = 0
        end
        object BtnOpen: TButton
          Left = 373
          Top = 22
          Width = 32
          Height = 26
          Caption = '...'
          TabOrder = 1
          OnClick = BtnOpenClick
        end
      end
    end
    object TabSheet4: TTabSheet
      Caption = 'PCB tools'
      ExplicitLeft = 0
      ExplicitTop = 0
      ExplicitWidth = 0
      ExplicitHeight = 0
      object GroupBox9: TGroupBox
        Left = 7
        Top = 9
        Width = 413
        Height = 359
        Caption = 'PCB tools'
        TabOrder = 0
      end
    end
  end
  object SaveDialog1: TSaveDialog
    DefaultExt = '.html'
    Filter = 
      'Html files (*.html)|*.HTML|Text files (*.txt)|*.TXT|All Files (*' +
      '.*)|*.*'
    Left = 392
    Top = 96
  end
  object OpenDialog1: TOpenDialog
    Filter = 
      'Fieldvalue(key)-Refs(value) (*.json)|*.JSON|Text files (*.txt)|*' +
      '.TXT|All Files (*.*)|*.*'
    Left = 352
    Top = 96
  end
end
