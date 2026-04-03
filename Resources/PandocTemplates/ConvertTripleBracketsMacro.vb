Sub ConvertTripleBracketsToEquationKeepStyle()
    Dim doc As Document
    Dim searchRange As Range
    Dim startRange As Range
    Dim endRange As Range
    Dim eqRange As Range
    Dim bracketDelete As Range
    Dim objEq As OMath
    
    Set doc = ActiveDocument
    Set searchRange = doc.Content
    
    Application.ScreenUpdating = False ' Disable screen updates for speed
    
    Do
        ' 1. Find the opening {{{
        With searchRange.Find
            .ClearFormatting
            .Text = "{{{"
            .MatchWildcards = False
            .Forward = True
            .Wrap = wdFindStop
            .Execute
        End With
        
        ' If no more opening brackets found, exit loop
        If Not searchRange.Find.Found Then Exit Do
        
        ' Capture start position
        Set startRange = searchRange.Duplicate
        
        ' 2. Find the closing }}} starting from the end of the opening brackets
        Set endRange = doc.Range(startRange.End, doc.Content.End)
        With endRange.Find
            .ClearFormatting
            .Text = "}}}"
            .MatchWildcards = False
            .Forward = True
            .Wrap = wdFindStop
            .Execute
        End With
        
        If endRange.Find.Found Then
            ' 3. Define the full range covering {{{ content }}}
            Set eqRange = doc.Range(startRange.Start, endRange.End)
            
            ' 4. Remove the brackets carefully to preserve inner formatting
            
            ' A. Remove the last 3 characters (}}})
            Set bracketDelete = doc.Range(eqRange.End - 3, eqRange.End)
            bracketDelete.Delete
            
            ' B. Remove the first 3 characters ({{{)
            Set bracketDelete = doc.Range(eqRange.Start, eqRange.Start + 3)
            bracketDelete.Delete
            
            ' eqRange now automatically shrinks to contain only the inner text
            ' and preserves all Bold, Italic, Color, etc.
            
            ' 5. Convert the range to an Equation
            ' Note: Word Equations force the "Cambria Math" font, but will keep 
            ' bold/italic/color attributes.
            Set searchRange = doc.Range(eqRange.End, doc.Content.End) ' Save spot for next loop
            
            eqRange.OMaths.Add eqRange
            eqRange.OMaths.BuildUp
            
            ' 6. (Optional) Force "Normal Text" style
            ' If you want the text to look like standard text (not math variables),
            ' uncomment the line below:
            ' eqRange.OMaths(1).Range.Font.Italic = False 

            ' Update search range to continue after the new equation
            searchRange.Start = eqRange.OMaths(1).Range.End
            searchRange.End = doc.Content.End
        Else
            ' Found opening but no closing, exit to prevent infinite loop
            Exit Do
        End If
    Loop
    
    Application.ScreenUpdating = True
    MsgBox "Conversion complete! Formatting preserved.", vbInformation
End Sub