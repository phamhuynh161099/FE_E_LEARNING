import permissionApiRequest from "@/apis/permission.api";
import roleApiRequest from "@/apis/role.api";
import userApiRequest from "@/apis/user.api";
import { MultiSelect } from "@/components/multi-select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useCurrentUser } from "@/stores/auth-store.zustand";
import useLoadingStore from "@/stores/loading-store.zustand";
import {
  EyeIcon,
  EyeOffIcon,
  Save,
  TableProperties,
  Upload,
  UserPen,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadList,
  FileUploadTrigger,
} from "@/components/ui/file-upload";
import videoApiRequest from "@/apis/video.api";

interface IPermision {
  id: number;
  name: string;
  resource: string;
  action: string;
  description: string;
  category: string;
}

interface IAddVideoPopupProps {
  open: boolean;
  onOpenChange: (value: boolean, needRefresh: boolean) => void;
}

const AddVideoPopup = ({ open, onOpenChange }: IAddVideoPopupProps) => {
  const router = useRouter();
  const { zStartLoading, zEndLoading } = useLoadingStore();
  const [showPassword, setShowPassword] = useState(false);
  const [dataAdd, setDataAdd] = useState<any>({
    roleId: "",
    permissionIds: [],
    name: "",
    description: [],
  });
  const [roleOption, setRoleOption] = useState<
    {
      value: string;
      label: string;
    }[]
  >([]);
  const currentUserInfor = useCurrentUser();
  const [files, setFiles] = useState<File[]>([]);

  const onFileReject = useCallback((file: File, message: string) => {
    toast(message, {
      description: `"${file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name}" has been rejected`,
    });
  }, []);

  //🧨
  const [selectedRole, setSelectedRole] = useState<string[]>([]);

  useEffect(() => {
    const fetchGetAllRole = async () => {
      try {
        const payload = await roleApiRequest.sGetAll({});
        const { data } = payload.payload;

        console.log("Role", data);
        let _roleOption = [];
        for (let idx = 0; idx < data.length; idx++) {
          const item = data[idx];
          _roleOption.push({
            value: item.id,
            label: item.name,
          });
        }

        setRoleOption(_roleOption);
        // setSelected(new Set());
      } catch (error) {
        console.error("[System] get All role failed:", error);
      }
    };

    fetchGetAllRole();
  }, []);

  const onClickSubmitForm = async () => {
    try {
      zStartLoading();
      //   const parameter = {
      //     username: dataAdd["username"],
      //     password: dataAdd["password"],
      //     email: dataAdd["email"],
      //   };
      const formData = new FormData();
      formData.append("file", files[0]);
      let res = await videoApiRequest.sUploadVideo(formData);

      //   console.log("res", res);
      console.log("upload file", files);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Update Fail");
    } finally {
      zEndLoading();
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onOpenChange(false, false)}>
      <DialogContent
        className="max-w-full max-h-screen rounded-lg md:max-w-200 p-3"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="font-bold text-xl">
            <div className="flex gap-2 items-center">
              <div className="border rounded-md p-2 shadow-md shadow-sky-200">
                <TableProperties className="size-6" />
              </div>
              Video Add
            </div>
          </DialogTitle>
          <DialogDescription className="hidden" />
        </DialogHeader>

        <Separator className="bg-black" />

        <div className="no-scrollbar -mx-4 max-h-[60vh] overflow-y-auto px-4 pb-4">
          {dataAdd && (
            <div className="p-1 overflow-y-auto max-h-[calc(100vh-200px)]">
              <div className="grid w-full items-center gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="flex flex-col space-y-1.5">
                    <Label>Username</Label>
                    <Input
                      defaultValue={dataAdd["username"]}
                      onChange={(e) =>
                        setDataAdd((prev: any) => ({
                          ...prev,
                          username: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="flex flex-col space-y-1.5">
                    <Label>Upload</Label>
                    <FileUpload
                      maxFiles={1}
                      maxSize={5 * 1024 * 1024 * 1024}
                      className="w-full max-w-md"
                      value={files}
                      onValueChange={setFiles}
                      onFileReject={onFileReject}
                      multiple
                    >
                      <FileUploadDropzone>
                        <div className="flex flex-col items-center gap-1 text-center">
                          <div className="flex items-center justify-center rounded-full border p-2.5">
                            <Upload className="size-6 text-muted-foreground" />
                          </div>
                          <p className="font-medium text-sm">
                            Drag & drop files here
                          </p>
                          <p className="text-muted-foreground text-xs">
                            Or click to browse (max 1 files, up to 5GB)
                          </p>
                        </div>
                        <FileUploadTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2 w-fit"
                          >
                            Browse files
                          </Button>
                        </FileUploadTrigger>
                      </FileUploadDropzone>
                      <FileUploadList>
                        {files.map((file, index) => (
                          <FileUploadItem key={index} value={file}>
                            <FileUploadItemPreview />
                            <FileUploadItemMetadata />
                            <FileUploadItemDelete asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-7"
                              >
                                <X />
                              </Button>
                            </FileUploadItemDelete>
                          </FileUploadItem>
                        ))}
                      </FileUploadList>
                    </FileUpload>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <Separator className="bg-black" />

        <DialogFooter>
          <Button type="submit" onClick={onClickSubmitForm}>
            <Save />
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddVideoPopup;
