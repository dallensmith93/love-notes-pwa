Add-Type -AssemblyName System.Drawing
$base = Join-Path $PSScriptRoot "..\client\public"
foreach ($size in 192, 512) {
  $bmp = New-Object System.Drawing.Bitmap($size, $size)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.Clear([System.Drawing.Color]::FromArgb(255, 45, 31, 36))
  $brush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 232, 180, 188))
  $fontSize = [math]::Max(48, [int]($size / 5))
  $font = New-Object System.Drawing.Font("Segoe UI Symbol", $fontSize, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
  $sf = New-Object System.Drawing.StringFormat
  $sf.Alignment = [System.Drawing.StringAlignment]::Center
  $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
  $rect = New-Object System.Drawing.RectangleF(0, 0, $size, $size)
  $g.DrawString([char]0x2665, $font, $brush, $rect, $sf)
  $path = Join-Path $base "pwa-${size}x${size}.png"
  $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose()
  $bmp.Dispose()
  Write-Output $path
}
