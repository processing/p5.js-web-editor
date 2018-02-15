

export const fileExtensionsArray = ['gif', 'jpg', 'jpeg', 'png', 'bmp', 'wav', 'flac', 'ogg',
  'oga', 'mp4', 'm4p', 'mp3', 'm4a', 'aiff', 'aif', 'm4v', 'aac', 'webm', 'mpg', 'mp2',
  'mpeg', 'mpe', 'mpv', 'js', 'jsx', 'html', 'htm', 'css', 'json', 'csv', 'obj', 'svg',
  'otf', 'ttf', 'txt', 'mov'];

export const mimeTypes = `image/*,audio/*,text/javascript,text/html,text/css,
application/json,application/x-font-ttf,application/x-font-truetype,text/plain,
text/csv,.obj,video/webm,video/ogg,video/quicktime,video/mp4`;

export const fileExtensions = fileExtensionsArray.map(ext => `.${ext}`).join(',');
export const fileExtensionsAndMimeTypes = `${fileExtensions},${mimeTypes}`;

export const MEDIA_FILE_REGEX =
  new RegExp(`^(?!(http:\\/\\/|https:\\/\\/)).*\\.(${fileExtensionsArray.join('|')})$`, 'i');

export const MEDIA_FILE_QUOTED_REGEX =
  new RegExp(`^('|")(?!(http:\\/\\/|https:\\/\\/)).*\\.(${fileExtensionsArray.join('|')})('|")$`, 'i');

export const STRING_REGEX = /(['"])((\\\1|.)*?)\1/gm;
export const TEXT_FILE_REGEX = /(.+\.json$|.+\.txt$|.+\.csv$)/i;
export const NOT_EXTERNAL_LINK_REGEX = /^(?!(http:\/\/|https:\/\/))/;
export const EXTERNAL_LINK_REGEX = /^(http:\/\/|https:\/\/)/;
