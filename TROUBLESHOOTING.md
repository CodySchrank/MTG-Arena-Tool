This is meant as a guide to help you locate and resolve the most common issues running MTG Arena Tool. **Please** only follow these steps if you encounter one of the issues mentioned.

### If the app freezes in loading "Just a second" page:

Locate your log and config files;
- Close MTG Arena and MTG Arena Tool.
- Go to `%APPDATA%\..\LocalLow\Wizards Of The Coast\MTGA\`
- Proceed deleting `output.log`.
- Run MTG Arena, once open, run MTG Arena Tool again.

If that does not work;
- Proceed to `%APPDATA%\mtg-arena-tool`
- Locate a .json file named with your User ID, something like `0A1F2E3E4D5C6B7A.json`
- Rename the file, adding something to the end. **Do not delete it!**
- Run MTG Arena Tool again.

If the last step worked, send the the .json file to [mtgatool@gmail.com](mailto:mtgatool@gmail.com) and I will inspect what is wrong with it.
