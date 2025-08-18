export const getAssetsPath = (filename?: string) => {
  const basePath = `${import.meta.env.BASE_URL}assets`;

  return filename ? `${basePath}/${filename}` : basePath;
};

export type AssetType = "images" | "sounds" | "json" | "tiled" | "fonts";

export function getAssetsPathByType({
  type,
  filename,
  scene,
}: {
  type: AssetType;
  filename: string;
  scene?: string;
}) {
  let scenePath = scene ? `/scenes/${scene}` : "";

  return `${getAssetsPath()}/${type + scenePath}/${filename}`;
}

