"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  //   const { zStatusLoading } = useLoadingStore();
  return (
    <>
      {/* <UnProtectRouter> */}
      {children}
      {/* </UnProtectRouter> */}

      {/* {zStatusLoading && <CusLoading />} */}
    </>
  );
}

// const UnProtectRouter = ({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) => {
//   const router = useRouter();
//   const [canAccess, setCanAccess] = useState<boolean>(false);

//   useEffect(() => {
//     const accessToken = localStorage.getItem(
//       LOCAL_STORAGE_KEYS.WF_ACCESS_TOKEN,
//     );
//     if (accessToken) {
//       router.push("/admin/main-dashboard");
//     } else {
//       setCanAccess(true);
//     }
//   }, [router]);

//   return <>{canAccess && children}</>;
// };
