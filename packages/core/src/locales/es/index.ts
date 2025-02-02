import type { LocalePhrasesRoot } from '@staticcms/core/interface';

const es: LocalePhrasesRoot = {
  auth: {
    login: 'Iniciar sesión',
    loggingIn: 'Iniciando sesión...',
    loginWithNetlifyIdentity: 'Iniciar sesión con Netlify Identity',
    loginWithBitbucket: 'Iniciar sesión con Bitbucket',
    loginWithGitHub: 'Iniciar sesión con GitHub',
    loginWithGitLab: 'Iniciar sesión con GitLab',
    loginWithGitea: 'Iniciar sesión con Gitea',
    errors: {
      email: 'Asegúrate de introducir tu correo electrónico.',
      password: 'Por favor introduce tu contraseña.',
      identitySettings:
        'No se pudo acceder a la configuración de Identity. Cuando uses el backend git-gateway asegurate de habilitar el servicio Identity y Git Gateway.',
    },
  },
  app: {
    header: {
      content: 'Contenido',
      media: 'Medios',
      quickAdd: 'Añadir rápido',
    },
    app: {
      errorHeader: 'Error al cargar la configuración del CMS',
      configErrors: 'Errores de configuración',
      checkConfigYml: 'Compruebe el archivo config.yml.',
      loadingConfig: 'Cargando configuración....',
      waitingBackend: 'Esperando al servidor...',
    },
    notFoundPage: {
      header: 'No encontrado',
    },
  },
  collection: {
    sidebar: {
      collections: 'Colecciones',
      searchAll: 'Buscar todas',
    },
    collectionTop: {
      sortBy: 'Ordenar por',
      viewAs: 'Ver como',
      newButton: 'Nuevo %{collectionLabel}',
      ascending: 'Ascendente',
      descending: 'Descendente',
    },
    entries: {
      loadingEntries: 'Cargando entradas',
      cachingEntries: 'Almacenando entradas en caché',
      longerLoading: 'Esto puede tardar varios minutos',
      noEntries: 'Ninguna entrada',
    },
    defaultFields: {
      author: {
        label: 'Autor',
      },
      updatedOn: {
        label: 'Actualizado en',
      },
    },
  },
  editor: {
    editorControl: {
      field: {
        optional: 'opcional',
      },
    },
    editorControlPane: {
      widget: {
        required: '%{fieldLabel} es obligatorio.',
        regexPattern: '%{fieldLabel} no coincide con el patrón: %{pattern}.',
        processing: '%{fieldLabel} está procesando.',
        range: '%{fieldLabel} debe estar entre %{minValue} y %{maxValue}.',
        min: '%{fieldLabel} debe ser por lo menos %{minValue}.',
        max: '%{fieldLabel} debe ser %{maxValue} o menos.',
        rangeCount: '%{fieldLabel} debe tener entre %{minCount} y %{maxCount} elemento(s).',
        rangeCountExact: '%{fieldLabel} debe tener exactamente %{count} elemento(s).',
        rangeMin: '%{fieldLabel} debe ser por lo menos %{minCount} elemento(s).',
        rangeMax: '%{fieldLabel} debe ser %{maxCount} o menos elemento(s).',
      },
    },
    editor: {
      onLeavePage: '¿Estás seguro de que quieres dejar esta página?',
      onDeleteWithUnsavedChangesBody:
        '¿Está seguro de que desea eliminar esta entrada publicada, así como los cambios no guardados de la sesión actual?',
      onDeletePublishedEntryBody: '¿Estás seguro de que quieres borrar esta entrada publicada?',
      loadingEntry: 'Cargando entrada...',
    },
    editorToolbar: {
      publish: 'Publicar',
      published: 'Publicado',
      unpublish: 'Retirar',
      duplicate: 'Duplicar',
      publishAndCreateNew: 'Publicar y crear nuevo',
      publishAndDuplicate: 'Publicar y duplicar',
      deleteEntry: 'Eliminar entrada',
      publishNow: 'Publicar ahora',
    },
    editorWidgets: {
      markdown: {
        richText: 'Texto enriquecido',
        markdown: 'Markdown',
      },
      image: {
        choose: 'Elige una imagen',
        chooseDifferent: 'Elige una imagen diferente',
        remove: 'Quita la imagen',
      },
      file: {
        choose: 'Escoge un archivo',
        chooseDifferent: 'Elige un archivo diferente',
        remove: 'Remover archivo',
      },
      unknownControl: {
        noControl: "No existe un control para el widget '%{widget}'.",
      },
      unknownPreview: {
        noPreview: "No existe una vista previa para el widget '%{widget}'.",
      },
      headingOptions: {
        headingOne: 'Encabezado 1',
        headingTwo: 'Encabezado 2',
        headingThree: 'Encabezado 3',
        headingFour: 'Encabezado 4',
        headingFive: 'Encabezado 5',
        headingSix: 'Encabezado 6',
      },
      datetime: {
        now: 'Ahora',
      },
    },
  },
  mediaLibrary: {
    mediaLibraryCard: {
      draft: 'Borrador',
    },
    mediaLibrary: {
      onDeleteBody: '¿Está seguro de que desea eliminar el archivo seleccionado?',
      fileTooLargeBody:
        'Archivo muy pesado.\nConfigurado para no permitir archivos más pesados que %{size} kB.',
    },
    mediaLibraryModal: {
      loading: 'Cargando...',
      noResults: 'Sin resultados.',
      noAssetsFound: 'Archivos no encontrados.',
      noImagesFound: 'Imágenes no encontradas.',
      images: 'Imágenes',
      mediaAssets: 'Archivos multimedia',
      search: 'Buscar...',
      uploading: 'Subiendo...',
      upload: 'Subir nuevo',
      download: 'Descargar',
      deleting: 'Eliminando...',
      deleteSelected: 'Eliminar selección',
      chooseSelected: 'Confirmar selección',
    },
  },
  ui: {
    default: {
      goBackToSite: 'Regresar al sitio',
    },
    errorBoundary: {
      title: 'Error',
      details: 'Se ha producido un error - por favor ',
      reportIt: 'infórmenos de ello.',
      detailsHeading: 'Detalles',
      privacyWarning:
        'Abrir un reporte lo rellena previamente con el mensaje de error y los datos de depuración.\nPor favor verifica que la información es correcta y elimina cualquier dato sensible.',
      recoveredEntry: {
        heading: 'Documento recuperado',
        warning: '¡Por favor, copie/pegue esto en algún lugar antes de ir a otra página!',
        copyButtonLabel: 'Copiar al portapapeles',
      },
    },
    settingsDropdown: {
      logOut: 'Cerrar sesión',
    },
    toast: {
      onFailToLoadEntries: 'No se ha podido cargar la entrada: %{details}',
      onFailToLoadDeployPreview: 'No se ha podido cargar la vista previa: %{details}',
      onFailToPersist: 'No se ha podido guardar la entrada: %{details}',
      onFailToDelete: 'No se ha podido borrar la entrada: %{details}',
      onFailToUpdateStatus: 'No se ha podido actualizar el estado: %{details}',
      missingRequiredField:
        'Oops, no ha rellenado un campo obligatorio. Por favor, rellénelo antes de guardar.',
      entrySaved: 'Entrada guardada',
      entryPublished: 'Entrada publicada',
      onFailToPublishEntry: 'No se ha podido publicar: %{details}',
      entryUpdated: 'Estado de entrada actualizado',
      onFailToAuth: '%{details}',
    },
  },
};

export default es;
