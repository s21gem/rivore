export const optimizeCloudinaryUrl = (url: string | undefined | null, width?: number): string => {
  if (!url) return '';
  
  // Check if it's actually a Cloudinary URL
  if (!url.includes('cloudinary.com')) {
    return url;
  }

  // Parse the Cloudinary URL
  // Format: https://res.cloudinary.com/<cloud_name>/image/upload/<transformations>/v<version>/<public_id>
  const urlParts = url.split('/upload/');
  
  if (urlParts.length !== 2) return url;

  const base = urlParts[0] + '/upload/';
  let pathAndVersion = urlParts[1];
  
  // Remove existing transformations if they exist (usually looks like q_auto,f_auto,etc.)
  if (pathAndVersion.match(/^[a-z]_[^/]+\//)) {
    // Has transformations at the start, remove them
    pathAndVersion = pathAndVersion.substring(pathAndVersion.indexOf('/') + 1);
  }

  // Build new transformations
  const transforms = [];
  transforms.push('f_auto');
  transforms.push('q_auto');
  
  if (width) {
    transforms.push(`w_${width}`);
    transforms.push('c_fill');
  }

  return `${base}${transforms.join(',')}/${pathAndVersion}`;
};
