import service from "../utils/request";

/**
 * 上传图片到后端
 * @param file 图片文件
 * @returns 返回上传成功的 URL
 */
export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const res = (await service.post(
    "/api/merchant/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  )) as any;

  if (res.success && res.data) {
    return res.data;
  } else {
    throw new Error(res.msg || "上传图片失败");
  }
}

/**
 * 删除图片
 * @param imageUrl 要删除的完整图片 URL
 * @returns 删除结果
 */
export async function deleteImage(imageUrl: string): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res = (await service.delete("/api/merchant/upload", {
    data: { imageUrl },
  })) as any;

  if (!res.success) {
    throw new Error(res.msg || "删除图片失败");
  }
}
