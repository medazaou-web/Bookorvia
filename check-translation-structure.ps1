$json = Get-Content lib/i18n/locales/en.json | ConvertFrom-Json
$categories = $json.PSObject.Properties.Name | Sort-Object
Write-Host "Translation Categories:" -ForegroundColor Cyan
$categories | ForEach-Object { 
  $count = ($json.$_).PSObject.Properties.Name.Count
  Write-Host "$_ - $count keys"
}
