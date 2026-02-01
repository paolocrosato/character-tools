import fs from 'fs';
import path from 'path';

// Icon mapping from Font Awesome to Lucide React
const iconMapping = {
  'faCopy': { component: 'Copy', size: 16 },
  'faFileUpload': { component: 'Upload', size: 32 },
  'faUpLong': { component: 'ArrowUp', size: 20 },
  'faUser': { component: 'User', size: 16 },
  'faUndo': { component: 'Undo', size: 16 },
  'faPlus': { component: 'Plus', size: 16 },
  'faTimes': { component: 'X', size: 16 },
  'faSun': { component: 'Sun', size: 16 },
  'faPencil': { component: 'Pencil', size: 16 },
  'faTrashAlt': { component: 'Trash2', size: 16 },
  'faFileImport': { component: 'FileImport', size: 20 },
  'faTimesCircle': { component: 'XCircle', size: 16 },
  'faArrowLeft': { component: 'ArrowLeft', size: 20 },
  'faEdit': { component: 'Pencil', size: 16 },
  'faTrash': { component: 'Trash', size: 16 },
  'faUsersBetweenLines': { component: 'Users', size: 20 },
  'faUserGear': { component: 'Settings', size: 20 },
  'faChevronDown': { component: 'ChevronDown', size: 16 },
  'faBug': { component: 'Bug', size: 16 },
  'faMoon': { component: 'Moon', size: 16 },
  'faScrewdriverWrench': { component: 'Wrench', size: 16 },
  // Additional icons from NavigationMenu
  'faBars': { component: 'Menu', size: 16 },
  'faBook': { component: 'Book', size: 16 },
  'faDatabase': { component: 'Database', size: 16 },
  'faHome': { component: 'Home', size: 16 },
  'faUserPen': { component: 'PenTool', size: 16 },
  'faBars': { component: 'Menu', size: 16 },
  'faBook': { component: 'Book', size: 16 }
};

// Files to migrate
const filesToMigrate = [
  'src/components/characterEditor/CharacterData.tsx',
  'src/components/characterEditor/ToolbarDial.tsx',
  'src/components/characterEditor/exportOrSave/ExportCharacterNameTemplate.tsx',
  'src/components/ui/form/NumberField.tsx',
  'src/components/characterEditor/CharacterMetadata.tsx',
  'src/components/characterEditor/PromptEngingeering.tsx',
  'src/Layouts/Header.tsx',
  'src/components/characterBookLibrary/CharacterBookTable.tsx',
  'src/components/characterLibrary/CharacterTable.tsx',
  'src/components/characterLibrary/ManageLibrary.tsx',
  'src/components/characterBookLibrary/ManageLibrary.tsx',
  'src/components/characterBookEditor/ImportOrCreate.tsx',
  'src/components/characterBookLibrary/ImportCharacterBooks.tsx',
  'src/components/characterLibrary/ImportCharacter.tsx',
  'src/components/characterBookEditor/EntriesEditor.tsx',
  'src/components/characterBookEditor/EntryEditor.tsx',
  'src/components/characterBookEditor/ExportCharacterBookNameTemplate.tsx',
  'src/routes/CharacterLibrary.tsx',
  'src/routes/ManageDatabase.tsx',
  'src/routes/CharacterBookEditorPage.tsx',
  'src/routes/CharacterEditor.tsx',
  'src/routes/Home.tsx'
];

function migrateFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${filePath} - file not found`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Find which Font Awesome icons are used
  for (const [faIcon, lucideIcon] of Object.entries(iconMapping)) {
    // Check if file imports this icon
    const importRegex = new RegExp(`import\\s*\\{\\s*${faIcon}\\s*}\\s*}\\s*from\\s+['"]@fortawesome/free-solid-svg-icons['"]`, 'g');
    if (importRegex.test(content)) {
      console.log(`Found ${faIcon} in ${filePath}`);

      // Replace import
      content = content.replace(
        importRegex,
        `import { ${lucideIcon.component} } from 'lucide-react'`
      );
      modified = true;
    }
  }

  // Replace FontAwesomeIcon usage with Lucide icon
  const faIconUsageRegex = /<FontAwesomeIcon\s*\n\s*icon=\{([^}]+)\}\s*\n\s*(?:size="([^"]+)"\s*)?\s*\/>/g;
  content = content.replace(faIconUsageRegex, (match, faIcon, sizeStr) => {
    const lucideIcon = iconMapping[faIcon];
    if (!lucideIcon) {
      console.warn(`No mapping found for ${faIcon}, skipping`);
      return match;
    }
    const size = sizeStr ? parseInt(sizeStr.replace(/"/g, '')) : lucideIcon.size;
    return `<${lucideIcon.component} size={size} />`;
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Migrated ${filePath}`);
  }
}

// Migrate all files
console.log('Starting icon migration...');
filesToMigrate.forEach(migrateFile);
console.log('Migration complete!');
