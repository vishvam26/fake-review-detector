@echo off
echo Staging, committing, and pushing changes to GitHub...
echo.

:: Show status first
git status
echo.

:: Stage all changes
echo Staging changes...
git add .
echo.

:: Commit changes
echo Committing changes...
git commit -m "Clean up integrations section and update contact details"
echo.

:: Push changes
echo Pushing to GitHub...
git push
echo.

echo GitHub push completed!
echo.
pause
