"use client";
import authApiRequest from "@/apis/auth.api";
import { AppSidebar } from "@/components/app-sidebar";
import CusLoading from "@/components/cus-loading";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { LOCAL_STORAGE_KEYS } from "@/constants/local-storage.const";
import {
  useAuthState,
  useCurrentUser,
  useHasHydrated,
  useUserStore,
} from "@/stores/auth-store.zustand";
import useLoadingStore from "@/stores/loading-store.zustand";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { zStatusLoading } = useLoadingStore();

  console.log("layout f5");
  return (
    <>
      <ProtectRouter>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset className="overflow-auto">
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
              <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator
                  orientation="vertical"
                  className="mr-2 data-[orientation=vertical]:h-4"
                />
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink href="#">
                        Build Your Application
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </header>
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0 overflow-auto">
              {children}
            </div>
          </SidebarInset>
        </SidebarProvider>
      </ProtectRouter>

      {zStatusLoading && <CusLoading />}

      {/* Load CSS */}
      {/* <link
        rel="stylesheet"
        href="/libs/tabulator-master/dist/css/tabulator.min.css"
      />
      <link
        rel="stylesheet"
        href="/libs/tabulator-master/dist/css/tabulator_midnight.min.css"
      /> */}
      {/* Load JS */}
      {/* <script src="/libs/tabulator-master/dist/js/tabulator.min.js" /> */}
    </>
  );
}

const ProtectRouter = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const router = useRouter();
  const pathname = usePathname();
  const currentUserInfor = useCurrentUser();
  const hasHydrated = useHasHydrated();
  const [canAccess, setCanAccess] = useState<boolean>(false);
  const { updateUserInfor } = useUserStore();

  useEffect(() => {
    if (!hasHydrated) return;
    const accessToken = localStorage.getItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);
    /**
     * Check access
     * Check Role Permission
     */
    if (!accessToken) {
      router.push("/login");
    } else {
      fetchCurrentUser();
    }
  }, [router, pathname, hasHydrated]);

  const fetchCurrentUser = async () => {
    try {
      const payload = await authApiRequest.sMe(); // placeholder
      const userData = payload.payload;
      setCanAccess(true);
      updateUserInfor(userData);
    } catch (error) {
      console.error("[ProtectRouter] getMe failed:", error);
      router.replace("/login");
    }
  };

  return <>{canAccess && children}</>;
};
