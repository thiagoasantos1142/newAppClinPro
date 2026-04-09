import * as ImagePicker from 'expo-image-picker';
import { uploadImage } from '../services/modules/reputation.service';

const IMAGE_PICKER_OPTIONS = {
  mediaTypes: ['images'],
  allowsEditing: false,
  quality: 1,
};

const getPermission = async (source) => {
  if (source === 'camera') {
    return ImagePicker.requestCameraPermissionsAsync();
  }

  return ImagePicker.requestMediaLibraryPermissionsAsync();
};

const launchPicker = async (source, options) => {
  if (source === 'camera') {
    return ImagePicker.launchCameraAsync(options);
  }

  return ImagePicker.launchImageLibraryAsync(options);
};

const buildUploadFile = (asset) => {
  const uri = asset?.uri;
  if (!uri) {
    throw new Error('Arquivo de imagem invalido.');
  }

  const extensionFromUri = uri.includes('.') ? uri.split('.').pop()?.split('?')[0] : null;
  const fileExtension = extensionFromUri || 'jpg';
  const fileName = asset?.fileName || `upload-${Date.now()}.${fileExtension}`;
  const mimeType = asset?.mimeType || `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`;

  return {
    uri,
    name: fileName,
    type: mimeType,
  };
};

export const pickAndUploadImage = async ({
  source,
  folder,
  allowsEditing = false,
  aspect,
}) => {
  const permission = await getPermission(source);
  if (!permission?.granted) {
    throw new Error(
      source === 'camera'
        ? 'Permita o acesso a camera para continuar.'
        : 'Permita o acesso a galeria para continuar.'
    );
  }

  const result = await launchPicker(source, {
    ...IMAGE_PICKER_OPTIONS,
    allowsEditing,
    ...(aspect ? { aspect } : {}),
  });

  if (result.canceled) {
    return null;
  }

  const asset = result.assets?.[0];
  const image = buildUploadFile(asset);
  const response = await uploadImage({ image, folder });

  return response?.data ?? response;
};
