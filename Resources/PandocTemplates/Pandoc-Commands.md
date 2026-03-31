## الأوامر

### ملف نظري (Theoretical):
```cmd
pandoc lecture.md -f markdown+fenced_divs+bracketed_spans+raw_attribute --wrap=none -o lecture.docx --reference-doc=Pandoc-Theo.dotx
```

### ملف عملي (Practical):
```cmd
pandoc lecture.md -f markdown+fenced_divs+bracketed_spans+raw_attribute --wrap=none -o lecture.docx --reference-doc=Pandoc-Prac.dotx
```

### ملف بنك أسئلة (Bank):

> البنك يستخدم نفس قالب النظري والعملي