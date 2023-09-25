import type { LocalePhrasesRoot } from '@staticcms/core/interface';

const en: LocalePhrasesRoot = {
  auth: {
    login: 'Login',
    loggingIn: 'Logging in...',
    loginWithNetlifyIdentity: 'Login with Netlify Identity',
    loginWithBitbucket: 'Login with Bitbucket',
    loginWithGitHub: 'Login with GitHub',
    loginWithGitLab: 'Login with GitLab',
    loginWithGitea: 'Login with Gitea',
    errors: {
      email: 'Make sure to enter your email.',
      password: 'Please enter your password.',
      authTitle: 'Error logging in',
      authBody: '%{details}',
      netlifyIdentityNotFound: 'Netlify Identity plugin not found',
      identitySettings:
        'Unable to access identity settings. When using git-gateway backend make sure to enable Identity service and Git Gateway.',
    },
  },
  app: {
    header: {
      content: 'Contents',
      media: 'Media',
      quickAdd: 'Quick add',
    },
    app: {
      errorHeader: 'Error loading the CMS configuration',
      configErrors: 'Config Errors',
      configNotFound: 'Config not found',
      checkConfigYml: 'Check your config.yml file.',
      loadingConfig: 'Loading configuration...',
      waitingBackend: 'Waiting for backend...',
    },
    notFoundPage: {
      header: 'Not Found',
    },
  },
  collection: {
    sidebar: {
      collections: 'Collections',
      allCollections: 'All Collections',
      searchAll: 'Search all',
      searchIn: 'Search in',
    },
    collectionTop: {
      sortBy: 'Sort by',
      viewAs: 'View as',
      newButton: 'New %{collectionLabel}',
      ascending: 'Ascending',
      descending: 'Descending',
      searchResults: 'Search Results for "%{searchTerm}"',
      searchResultsInCollection: 'Search Results for "%{searchTerm}" in %{collection}',
      filterBy: 'Filter by',
      groupBy: 'Group by',
    },
    entries: {
      loadingEntries: 'Loading Entries...',
      cachingEntries: 'Caching Entries...',
      longerLoading: 'This might take several minutes',
      noEntries: 'No Entries',
    },
    groups: {
      other: 'Other',
      negateLabel: 'Not %{label}',
    },
    defaultFields: {
      author: {
        label: 'Author',
      },
      updatedOn: {
        label: 'Updated On',
      },
    },
    notFound: 'Collection not found',
  },
  editor: {
    editorControl: {
      field: {
        optional: 'optional',
      },
    },
    editorControlPane: {
      widget: {
        required: '%{fieldLabel} is required.',
        regexPattern: "%{fieldLabel} didn't match the pattern: %{pattern}.",
        processing: '%{fieldLabel} is processing.',
        range: '%{fieldLabel} must be between %{minValue} and %{maxValue}.',
        min: '%{fieldLabel} must be at least %{minValue}.',
        max: '%{fieldLabel} must be %{maxValue} or less.',
        rangeCount: '%{fieldLabel} must have between %{minCount} and %{maxCount} item(s).',
        rangeCountExact: '%{fieldLabel} must have exactly %{count} item(s).',
        rangeMin: '%{fieldLabel} must have at least %{minCount} item(s).',
        rangeMax: '%{fieldLabel} must have %{maxCount} or less item(s).',
        invalidPath: `'%{path}' is not a valid path.`,
        pathExists: `Path '%{path}' already exists.`,
        invalidColor: `Color '%{color}' is invalid.`,
        invalidHexCode: `Hex codes must start with a # sign.`,
      },
      i18n: {
        writingInLocale: 'Writing in %{locale}',
      },
    },
    editor: {
      onLeavePage: 'Are you sure you want to leave this page?',
      onDeleteWithUnsavedChangesTitle: 'Delete this published entry?',
      onDeleteWithUnsavedChangesBody:
        'Are you sure you want to delete this published entry, as well as your unsaved changes from the current session?',
      onDeletePublishedEntryTitle: 'Delete this published entry?',
      onDeletePublishedEntryBody: 'Are you sure you want to delete this published entry?',
      loadingEntry: 'Loading entry...',
    },
    editorInterface: {
      sideBySideI18n: 'I18n Side by Side',
      preview: 'Preview',
      toggleI18n: 'Toggle i18n',
      togglePreview: 'Toggle preview',
      toggleScrollSync: 'Sync scrolling',
    },
    editorToolbar: {
      publish: 'Publish',
      published: 'Published',
      duplicate: 'Duplicate',
      publishAndCreateNew: 'Publish and create new',
      publishAndDuplicate: 'Publish and duplicate',
      deleteEntry: 'Delete entry',
      publishNow: 'Publish now',
      discardChanges: 'Discard changes',
      discardChangesTitle: 'Discard changes',
      discardChangesBody: 'Are you sure you want to discard the unsaved changed?',
    },
    editorWidgets: {
      markdown: {
        bold: 'Bold',
        italic: 'Italic',
        code: 'Code',
        link: 'Link',
        linkPrompt: 'Enter the URL of the link',
        headings: 'Headings',
        quote: 'Quote',
        bulletedList: 'Bulleted List',
        numberedList: 'Numbered List',
        addComponent: 'Add Component',
        richText: 'Rich Text',
        markdown: 'Markdown',
        type: 'Type...',
      },
      image: {
        choose: 'Choose an image',
        chooseMultiple: 'Choose images',
        chooseUrl: 'Insert from URL',
        replaceUrl: 'Replace with URL',
        promptUrl: 'Enter the URL of the image',
        chooseDifferent: 'Choose different image',
        addMore: 'Add more images',
        remove: 'Remove image',
        removeAll: 'Remove all images',
      },
      file: {
        choose: 'Choose a file',
        chooseUrl: 'Insert from URL',
        chooseMultiple: 'Choose files',
        replaceUrl: 'Replace with URL',
        promptUrl: 'Enter the URL of the file',
        chooseDifferent: 'Choose different file',
        addMore: 'Add more files',
        remove: 'Remove file',
        removeAll: 'Remove all files',
      },
      folder: {
        choose: 'Choose a folder',
        chooseUrl: 'Insert folder path',
        chooseMultiple: 'Choose folders',
        replaceUrl: 'Replace with path',
        promptUrl: 'Enter path of the folder',
        chooseDifferent: 'Choose different folder',
        addMore: 'Add more folders',
        remove: 'Remove folder',
        removeAll: 'Remove all folders',
      },
      unknownControl: {
        noControl: "No control for widget '%{widget}'.",
      },
      unknownPreview: {
        noPreview: "No preview for widget '%{widget}'.",
      },
      headingOptions: {
        headingOne: 'Heading 1',
        headingTwo: 'Heading 2',
        headingThree: 'Heading 3',
        headingFour: 'Heading 4',
        headingFive: 'Heading 5',
        headingSix: 'Heading 6',
      },
      datetime: {
        now: 'Now',
        invalidDateTitle: 'Invalid date',
        invalidDateBody: 'The date you entered is invalid.',
      },
      list: {
        add: 'Add %{item}',
        addType: 'Add %{item}',
        noValue: 'No value',
      },
      keyvalue: {
        key: 'Key',
        value: 'Value',
        uniqueKeys: '%{keyLabel} must be unique',
      },
    },
  },
  mediaLibrary: {
    mediaLibraryCard: {
      draft: 'Draft',
      copy: 'Copy',
      copyUrl: 'Copy URL',
      copyPath: 'Copy Path',
      copyName: 'Copy Name',
      copied: 'Copied',
    },
    mediaLibrary: {
      onDeleteTitle: 'Delete selected media?',
      onDeleteBody: 'Are you sure you want to delete selected media?',
      fileTooLargeTitle: 'File too large',
      fileTooLargeBody: 'File too large.\nConfigured to not allow files greater than %{size} kB.',
      alreadyExistsTitle: 'File already exists',
      alreadyExistsBody: `%{filename} already exists. Do you want to replace it?`,
    },
    mediaLibraryModal: {
      loading: 'Loading...',
      noResults: 'No results.',
      noAssetsFound: 'No assets found.',
      noImagesFound: 'No images found.',
      images: 'Images',
      mediaAssets: 'Media assets',
      search: 'Search...',
      uploading: 'Uploading...',
      upload: 'Upload',
      download: 'Download',
      deleting: 'Deleting...',
      deleteSelected: 'Delete selected',
      chooseSelected: 'Choose selected',
      dropImages: 'Drop images to upload',
      dropFiles: 'Drop files to upload',
    },
    folderSupport: {
      newFolder: 'New folder',
      createNewFolder: 'Create new folder',
      enterFolderName: 'Enter folder name...',
      home: 'Home',
      up: 'Up',
      upToFolder: 'Up to %{folder}',
    },
  },
  ui: {
    branchSelect: {
      branch: 'Branch',
    },
    common: {
      yes: 'Yes',
      no: 'No',
      okay: 'OK',
    },
    default: {
      goBackToSite: 'Go back to site',
    },
    localBackup: {
      hasLocalBackup: 'Has local backup',
    },
    errorBoundary: {
      title: 'Error',
      details: "There's been an error - please ",
      reportIt: 'open an issue on GitHub.',
      detailsHeading: 'Details',
      privacyWarning:
        'Opening an issue pre-populates it with the error message and debugging data.\nPlease verify the information is correct and remove sensitive data if exists.',
      recoveredEntry: {
        heading: 'Recovered document',
        warning: 'Please copy/paste this somewhere before navigating away!',
        copyButtonLabel: 'Copy to clipboard',
      },
    },
    settingsDropdown: {
      theme: 'Theme',
      logOut: 'Log Out',
    },
    toast: {
      onFailToLoadEntries: 'Failed to load entry: %{details}',
      onFailToPersist: 'Failed to persist entry: %{details}',
      onFailToPersistMedia: 'Failed to persist media: %{details}',
      onFailToDelete: 'Failed to delete entry: %{details}',
      onFailToDeleteMedia: 'Failed to delete media: %{details}',
      onFailToUpdateStatus: 'Failed to update status: %{details}',
      missingRequiredField: "Oops, you've missed a required field. Please complete before saving.",
      entrySaved: 'Entry saved',
      entryPublished: 'Entry published',
      onFailToPublishEntry: 'Failed to publish: %{details}',
      entryUpdated: 'Entry status updated',
      onFailToAuth: '%{details}',
      onLoggedOut: 'You have been logged out, please back up any data and login again',
      onBackendDown:
        'The backend service is experiencing an outage. See %{details} for more information',
    },
  },
};

export default en;
