# Get all .tsx files in the src directory and subdirectories
$files = Get-ChildItem -Path ".\src" -Recurse -Filter "*.tsx"

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    
    # Remove fontFamily: 'Inter' and fontFamily: 'System'
    $newContent = $content -replace "fontFamily:\s*['`"]Inter['`"],?", "" -replace "fontFamily:\s*['`"]System['`"],?", ""
    
    # Only update if there were changes
    if ($content -ne $newContent) {
        Set-Content -Path $file.FullName -Value $newContent
        Write-Host "Updated $($file.FullName)"
    }
}

Write-Host "All fontFamily references have been removed" 