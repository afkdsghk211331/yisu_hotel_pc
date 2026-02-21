import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, RotateCcw, Eye } from "lucide-react";
import { toast } from "sonner";

import {
  auditHotel,
  getHotels,
  type Hotel,
  type HotelFilterBody,
  type HotelStatus,
} from "@/api/hotel";

const STATUS_MAP: Record<HotelStatus, { label: string; color: string }> = {
  pending: { label: "审核中", color: "bg-yellow-100 text-yellow-800" },
  published: { label: "已通过", color: "bg-green-100 text-green-800" },
  rejected: { label: "未通过", color: "bg-red-100 text-red-800" },
  offline: { label: "已下线", color: "bg-gray-100 text-gray-800" },
};

const CITIES = ["北京", "上海", "广州", "深圳", "杭州", "成都", "重庆", "西安"];
const STATUSES = [
  { value: "pending", label: "审核中" },
  { value: "published", label: "已通过" },
  { value: "rejected", label: "未通过" },
  { value: "offline", label: "已下线" },
] as const;

export function HotelReviewPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(false);

  // ✅ 统一：这些条件先在前端设置，点【搜索】才发请求生效
  const [searchName, setSearchName] = useState("");
  const [searchOwnerName, setSearchOwnerName] = useState("");
  const [filterStatus, setFilterStatus] = useState<HotelStatus | undefined>(undefined);
  const [filterCity, setFilterCity] = useState<string | undefined>(undefined);

  // 分页（后端支持）
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  // Dialog states
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [offlineDialogOpen, setOfflineDialogOpen] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [viewReasonDialogOpen, setViewReasonDialogOpen] = useState(false);

  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // ✅ 保存当前查询条件：审核后刷新保持筛选/分页
  const [currentQuery, setCurrentQuery] = useState<HotelFilterBody>({
    page: 1,
    page_size: 10,
  });

  const fetchHotels = async (body?: HotelFilterBody) => {
    setLoading(true);
    try {
      const res = await getHotels(body ?? {});
      if (!res.success) throw new Error(res.msg || "获取失败");
      const list: Hotel[] = res.data;
      setHotels(list);
    } catch (e: unknown) {
      toast.error("获取酒店列表失败", { description: e.message ?? "请稍后重试" });
    } finally {
      setLoading(false);
    }
  };

  const buildQueryBody = (override?: Partial<HotelFilterBody>): HotelFilterBody => {
    return {
      name: searchName.trim() ? searchName.trim() : undefined,
      owner_name: searchOwnerName.trim() ? searchOwnerName.trim() : undefined,
      status: filterStatus,
      city: filterCity, // ✅ 现在也走后端
      page,
      page_size: pageSize,
      ...override,
    };
  };

  // 首次加载：拉第一页
  useEffect(() => {
    const initBody: HotelFilterBody = { page: 1, page_size: pageSize };
    setCurrentQuery(initBody);
    fetchHotels(initBody);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async () => {
    // ✅ 搜索：从第一页开始
    const body = buildQueryBody({ page: 1 });
    setPage(1);
    setCurrentQuery(body);
    await fetchHotels(body);
  };

  const handleReset = async () => {
    setSearchName("");
    setSearchOwnerName("");
    setFilterStatus(undefined);
    setFilterCity(undefined);
    setPage(1);

    const body: HotelFilterBody = { page: 1, page_size: pageSize };
    setCurrentQuery(body);
    await fetchHotels(body);
  };

  const doAudit = async (hotelId: number, status: HotelStatus, reject_reason?: string) => {
    try {
      const res = await auditHotel({
        hotel_id: hotelId,
        status,
        ...(status === "rejected" ? { reject_reason } : {}),
      });
      if (!res.success) throw new Error(res.msg || "操作失败");

      await fetchHotels(currentQuery);
      return true;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "请稍后重试";
      toast.error("获取酒店列表失败", { description: msg });
    }
  };

  const handleApprove = async (hotel: Hotel) => {
    const ok = await doAudit(hotel.id, "published");
    if (ok) toast.success("审核通过", { description: `${hotel.name} 已审核通过并上线` });
  };

  const handleReject = async () => {
    if (!selectedHotel) return;
    if (!rejectionReason.trim()) {
      toast.error("请填写不通过原因");
      return;
    }

    const ok = await doAudit(selectedHotel.id, "rejected", rejectionReason.trim());
    if (ok) {
      toast.success("已标记为不通过", { description: `${selectedHotel.name} 已标记为不通过` });
      setRejectDialogOpen(false);
      setRejectionReason("");
      setSelectedHotel(null);
    }
  };

  const handleOffline = async () => {
    if (!selectedHotel) return;

    const ok = await doAudit(selectedHotel.id, "offline");
    if (ok) {
      toast.success("已下线", { description: `${selectedHotel.name} 已下线（软删除，可恢复）` });
      setOfflineDialogOpen(false);
      setSelectedHotel(null);
    }
  };

  const handleRestore = async () => {
    if (!selectedHotel) return;

    const ok = await doAudit(selectedHotel.id, "published");
    if (ok) {
      toast.success("已恢复上线", { description: `${selectedHotel.name} 已恢复上线` });
      setRestoreDialogOpen(false);
      setSelectedHotel(null);
    }
  };

  const openRejectDialog = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    setRejectionReason("");
    setRejectDialogOpen(true);
  };

  const openOfflineDialog = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    setOfflineDialogOpen(true);
  };

  const openRestoreDialog = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    setRestoreDialogOpen(true);
  };

  const openViewReasonDialog = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    setViewReasonDialogOpen(true);
  };

  const openDetailDialog = (hotel: Hotel) => {
    setSelectedHotel(hotel);
  };

  const goPrevPage = async () => {
    if (page <= 1) return;
    const next = page - 1;
    setPage(next);

    const body = buildQueryBody({ page: next });
    setCurrentQuery(body);
    await fetchHotels(body);
  };

  const goNextPage = async () => {
    const next = page + 1;
    setPage(next);

    const body = buildQueryBody({ page: next });
    setCurrentQuery(body);
    await fetchHotels(body);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">酒店审核列表</h2>
        <p className="mt-1 text-gray-500">审核和管理酒店信息发布</p>
      </div>

      {/* 筛选区 */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="mb-4 grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>酒店名称</Label>
              <Input
                placeholder="搜索酒店名称"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>商户名</Label>
              <Input
                placeholder="搜索商户名"
                value={searchOwnerName}
                onChange={(e) => setSearchOwnerName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>状态</Label>
              <Select
                value={filterStatus}
                onValueChange={(v) => setFilterStatus(v ? (v as HotelStatus) : undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="全部状态" />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>城市</Label>
              <Select value={filterCity} onValueChange={setFilterCity}>
                <SelectTrigger>
                  <SelectValue placeholder="全部城市" />
                </SelectTrigger>
                <SelectContent>
                  {CITIES.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button className="flex-1" onClick={handleSearch} disabled={loading}>
              <Search className="mr-2 h-4 w-4" />
              搜索
            </Button>
            <Button variant="outline" onClick={handleReset} disabled={loading}>
              <RotateCcw className="mr-2 h-4 w-4" />
              重置
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 列表区 */}
      <Card>
        <CardContent className="pt-6">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>酒店ID</TableHead>
                  <TableHead>酒店名称</TableHead>
                  <TableHead>城市</TableHead>
                  <TableHead>商户名</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {hotels.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-gray-500">
                      暂无数据
                    </TableCell>
                  </TableRow>
                ) : (
                  hotels.map((hotel) => (
                    <TableRow key={hotel.id} className="hover:bg-gray-50">
                      <TableCell className="font-mono text-sm">{hotel.id}</TableCell>

                      <TableCell>
                        <button
                          onClick={() => openDetailDialog(hotel)}
                          className="text-left font-medium text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {hotel.name}
                        </button>
                      </TableCell>

                      <TableCell>{hotel.city ?? "-"}</TableCell>
                      <TableCell>{hotel.owner_name ?? "-"}</TableCell>

                      <TableCell>
                        <Badge variant="outline" className={STATUS_MAP[hotel.status].color}>
                          {STATUS_MAP[hotel.status].label}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openDetailDialog(hotel)}
                          >
                            <Eye className="mr-1 h-3 w-3" />
                            查看
                          </Button>

                          {hotel.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleApprove(hotel)}
                                className="text-green-600 hover:text-green-700"
                              >
                                通过
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openRejectDialog(hotel)}
                                className="text-red-600 hover:text-red-700"
                              >
                                不通过
                              </Button>
                            </>
                          )}

                          {hotel.status === "rejected" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openViewReasonDialog(hotel)}
                              >
                                <Eye className="mr-1 h-3 w-3" />
                                查看原因
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleApprove(hotel)}
                                className="text-green-600 hover:text-green-700"
                              >
                                重新审核
                              </Button>
                            </>
                          )}

                          {hotel.status === "published" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openOfflineDialog(hotel)}
                              className="text-orange-600 hover:text-orange-700"
                            >
                              下线
                            </Button>
                          )}

                          {hotel.status === "offline" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openRestoreDialog(hotel)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              恢复
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
            <div>当前页：{page}</div>
            <div>本页 {hotels.length} 条</div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goPrevPage}
                disabled={loading || page <= 1}
              >
                上一页
              </Button>
              <Button variant="outline" size="sm" onClick={goNextPage} disabled={loading}>
                下一页
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 不通过原因弹窗 */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>审核不通过</DialogTitle>
            <DialogDescription>请填写不通过原因，以便商户修改后重新提交</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">不通过原因 *</Label>
              <Textarea
                id="reason"
                placeholder="请详细说明不通过的原因..."
                rows={4}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleReject}>确认</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 查看不通过原因弹窗 */}
      <Dialog open={viewReasonDialogOpen} onOpenChange={setViewReasonDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>不通过原因</DialogTitle>
            <DialogDescription>酒店：{selectedHotel?.name}</DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm">{selectedHotel?.reject_reason || "-"}</p>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setViewReasonDialogOpen(false)}>关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 下线确认弹窗 */}
      <AlertDialog open={offlineDialogOpen} onOpenChange={setOfflineDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认下线</AlertDialogTitle>
            <AlertDialogDescription>
              确定要下线「{selectedHotel?.name}」吗？
              <br />
              <span className="text-orange-600">
                下线后酒店将不再对外展示，但数据会保留，您可以随时恢复上线。
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleOffline}>确认下线</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 恢复确认弹窗 */}
      <AlertDialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认恢复上线</AlertDialogTitle>
            <AlertDialogDescription>
              确定要恢复「{selectedHotel?.name}」上线吗？
              <br />
              恢复后酒店将重新对外展示。
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestore}>确认恢复</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
