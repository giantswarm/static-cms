import type { LocalePhrasesRoot } from '@staticcms/core/interface';

const vi: LocalePhrasesRoot = {
  auth: {
    login: 'Đăng nhập',
    loggingIn: 'Đang đăng nhập...',
    loginWithNetlifyIdentity: 'Đăng nhập bằng Netlify Identity',
    loginWithBitbucket: 'Đăng nhập bằng Bitbucket',
    loginWithGitHub: 'Đăng nhập bằng GitHub',
    loginWithGitLab: 'Đăng nhập bằng GitLab',
    loginWithGitea: 'Đăng nhập bằng Gitea',
    errors: {
      email: 'Hãy nhập email của bạn.',
      password: 'Hãy nhập mật khẩu của bạn.',
      identitySettings:
        'Không thể truy cập thiêt lập danh tính. Hãy chắc chắn rằng bạn đã bật dịch vụ Identity và Git Gateway khi sử dụng git-gateway.',
    },
  },
  app: {
    header: {
      content: 'Nội dung',
      media: 'Tập tin',
      quickAdd: 'Tạo nhanh',
    },
    app: {
      errorHeader: 'Xảy ra lỗi khi tải cấu hình CMS',
      configErrors: 'Lỗi cấu hình',
      checkConfigYml: 'Kiểm tra lại file config.yml của bạn.',
      loadingConfig: 'Đang tải cấu hình...',
      waitingBackend: 'Đang chờ backend...',
    },
    notFoundPage: {
      header: 'Không tìm thấy',
    },
  },
  collection: {
    sidebar: {
      collections: 'Bộ sưu tập',
      allCollections: 'Tất cả bộ sưu tập',
      searchAll: 'Tìm kiếm tất cả',
      searchIn: 'Tìm kiếm trong',
    },
    collectionTop: {
      sortBy: 'Sắp xếp theo',
      viewAs: 'View as',
      newButton: '%{collectionLabel} mới',
      ascending: 'Tăng dần',
      descending: 'Giảm dần',
      searchResults: 'Kết quả tìm kiếm cho "%{searchTerm}"',
      searchResultsInCollection: 'Kết quả tìm kiếm cho "%{searchTerm}" trong %{collection}',
      filterBy: 'Lọc theo',
    },
    entries: {
      loadingEntries: 'Đang tải...',
      cachingEntries: 'Đang lưu...',
      longerLoading: 'Sẽ mất vài phút',
      noEntries: 'Không có mục nào',
    },
    defaultFields: {
      author: {
        label: 'Tác giả',
      },
      updatedOn: {
        label: 'Ngày cập nhật',
      },
    },
  },
  editor: {
    editorControl: {
      field: {
        optional: 'không bắt buộc',
      },
    },
    editorControlPane: {
      widget: {
        required: '%{fieldLabel} bắt buộc nhập.',
        regexPattern: '%{fieldLabel} không khớp với mẫu: %{pattern}.',
        processing: '%{fieldLabel} đang xử lý.',
        range: '%{fieldLabel} phải nằm trong khoảng từ %{minValue} đến %{maxValue}.',
        min: '%{fieldLabel} phải ít nhất %{minValue}.',
        max: '%{fieldLabel} tối đa %{maxValue} hoặc ít hơn.',
        rangeCount: '%{fieldLabel} phải nằm trong khoảng từ %{minCount} đến %{maxCount} mục.',
        rangeCountExact: '%{fieldLabel} phải có %{count} mục.',
        rangeMin: '%{fieldLabel} phải có ít nhất %{minCount} mục.',
        rangeMax: '%{fieldLabel} phải có tối đa %{maxCount} mục hoặc ít hơn.',
        invalidPath: `Đường dẫn '%{path}' không hợp lệ`,
        pathExists: `Đường dẫn '%{path}' đã tồn tại`,
      },
    },
    editor: {
      onLeavePage: 'Bạn có chắc rằng bạn muốn rời khỏi trang này?',
      onDeleteWithUnsavedChangesBody:
        'Bạn có chắc rằng bạn muốn xoá mục đã được công bố này, cũng như là những thay đổi chưa lưu của bạn trong phiên làm việc này?',
      onDeletePublishedEntryBody: 'Bạn có chắc rằng bạn muốn xoá mục đã được công bố này?',
      loadingEntry: 'Đang tải...',
    },
    editorToolbar: {
      publish: 'Công bố',
      published: 'Đã công bố',
      unpublish: 'Ngừng công bố',
      duplicate: 'Sao chép',
      publishAndCreateNew: 'Công bố và tạo mới',
      publishAndDuplicate: 'Công bố và sao chép',
      deleteEntry: 'Xoá mục này',
      publishNow: 'Công bố ngay',
    },
    editorWidgets: {
      markdown: {
        richText: 'Văn bản định dạng',
        markdown: 'Markdown',
      },
      image: {
        choose: 'Chọn một hình',
        chooseDifferent: 'Chọn hình khác',
        remove: 'Gỡ bỏ hình',
      },
      file: {
        choose: 'Chọn một tập tin',
        chooseDifferent: 'Chọn tập tin khác',
        remove: 'Gỡ bỏ tập tin',
      },
      unknownControl: {
        noControl: "Không tìm thấy control cho widget '%{widget}'.",
      },
      unknownPreview: {
        noPreview: "Không tìm thấy preview cho widget '%{widget}'.",
      },
      headingOptions: {
        headingOne: 'Tiêu đề cấp 1',
        headingTwo: 'Tiêu đề cấp 2',
        headingThree: 'Tiêu đề cấp 3',
        headingFour: 'Tiêu đề cấp 4',
        headingFive: 'Tiêu đề cấp 5',
        headingSix: 'Tiêu đề cấp 6',
      },
      datetime: {
        now: 'Ngay lúc này',
      },
    },
  },
  mediaLibrary: {
    mediaLibraryCard: {
      draft: 'Bản nháp',
    },
    mediaLibrary: {
      onDeleteBody: 'Bạn có chắc rằng bạn muốn xoá tập tin này?',
      fileTooLargeBody:
        'Tập tin quá lớn.\nCấu hình không cho phép những tập tin lớn hơn %{size} kB.',
    },
    mediaLibraryModal: {
      loading: 'Đang tải...',
      noResults: 'Không có kết quả.',
      noAssetsFound: 'Không tìm thấy tập tin nào.',
      noImagesFound: 'Không tìm thấy hình nào.',
      images: 'Hình ảnh',
      mediaAssets: 'Tập tin',
      search: 'Tìm kiếm...',
      uploading: 'Đang tải lên...',
      upload: 'Tải lên',
      download: 'Tải về',
      deleting: 'Đang xoá...',
      deleteSelected: 'Xoá những cái đã chọn',
      chooseSelected: 'Lấy những cái đã chọn',
    },
  },
  ui: {
    default: {
      goBackToSite: 'Quay về trang web',
    },
    errorBoundary: {
      title: 'Lỗi',
      details: 'Đã xảy ra lỗi - xin hãy ',
      reportIt: 'tạo một issue trên GitHub.',
      detailsHeading: 'Chi tiết',
      privacyWarning:
        'Tạo một issue với nội dung lỗi và dữ liệu debug được nhập sẵn.\nHãy xác nhận những thông tin này là đúng và gỡ bỏ dữ liệu nhạy cảm nếu cần thiết.',
      recoveredEntry: {
        heading: 'Tài liệu đã được phục hồi',
        warning: 'Hãy sao chép/dán nội dung này ở đâu đó trước khi chuyển sang trang khác!',
        copyButtonLabel: 'Sao chép vào vùng nhớ',
      },
    },
    settingsDropdown: {
      logOut: 'Đăng xuất',
    },
    toast: {
      onFailToLoadEntries: 'Không thể tải mục: %{details}',
      onFailToLoadDeployPreview: 'Không thể tải xem trước: %{details}',
      onFailToPersist: 'Không thể giữ lại mục: %{details}',
      onFailToDelete: 'Không thể xoá mục: %{details}',
      onFailToUpdateStatus: 'Không thể cập nhật trạng thái: %{details}',
      missingRequiredField: 'Bạn còn thiếu vài thông tin bắt buộc. Hãy hoàn thành trước khi lưu.',
      entrySaved: 'Mục đã được lưu',
      entryPublished: 'Mục đã được công bố',
      onFailToPublishEntry: 'Không thể công bố: %{details}',
      onFailToUnpublishEntry: 'Không thể ngừng công bố mục: %{details}',
      entryUpdated: 'Trạng thái của mục đã được cập nhật',
      onFailToAuth: '%{details}',
      onLoggedOut: 'Bạn đã đăng xuất, hãy sao lưu dữ liệu và đăng nhập lại',
      onBackendDown: 'Dịch vụ backend đang gặp trục trặc. Hãy xem {details} để biết thêm thông tin',
    },
  },
};

export default vi;
