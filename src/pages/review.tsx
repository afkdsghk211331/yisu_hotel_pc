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
import { Search, RotateCcw, Eye, Star, MapPin, Building2, Wifi, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  auditHotel,
  getHotels,
  getAdminHotelDetail,
  type Hotel,
  type Room,
  type HotelStatus,
  type AuditStatus,
  type HotelListFilter,
} from "@/api/hotel";

// 安全解析 JSON 数组字段（兼容后端返回字符串或数组）
function parseJsonArray(value: string[] | string | null | undefined): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

const STATUS_MAP: Record<HotelStatus, { label: string; color: string }> = {
  pending: { label: "审核中", color: "bg-yellow-100 text-yellow-800" },
  published: { label: "已通过", color: "bg-green-100 text-green-800" },
  rejected: { label: "未通过", color: "bg-red-100 text-red-800" },
  offline: { label: "未通过", color: "bg-gray-100 text-gray-800" },
};

const CITIES = ["北京", "上海", "广州", "深圳", "杭州", "成都", "重庆", "西安"];
const STATUSES = [
  { value: "pending", label: "审核中" },
  { value: "published", label: "已通过" },
  { value: "rejected", label: "未通过" },
] as const;

// ===================== 酒店详情弹窗 =====================
function HotelDetailDialog({
  open,
  onClose,
  hotel,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  hotel: Hotel | null;
  loading: boolean;
}) {
  if (!open) return null;

  const facilities = parseJsonArray(hotel?.facilities);
  const detailImages = parseJsonArray(hotel?.detail_images);
  const rooms: Room[] = hotel?.rooms ?? [];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="flex max-h-[88vh] max-w-4xl flex-col overflow-hidden p-0">
        <DialogHeader className="shrink-0 border-b px-6 pt-6 pb-4">
          <DialogTitle className="text-xl">
            {loading ? "加载中..." : (hotel?.name ?? "酒店详情")}
          </DialogTitle>
          {!loading && hotel && (
            <DialogDescription className="text-sm text-gray-500">
              {hotel.english_name || ""}
            </DialogDescription>
          )}
        </DialogHeader>

        {/* 可滚动内容区 */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : hotel ? (
            <div className="space-y-6">

              {/* 区块1：基础信息 */}
              <section>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  <Building2 className="h-4 w-4" />
                  基础信息
                </h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 rounded-lg border bg-gray-50 p-4 text-sm">
                  <div className="flex gap-2">
                    <span className="w-20 shrink-0 text-gray-500">酒店名称</span>
                    <span className="font-medium text-gray-900">{hotel.name || "-"}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="w-20 shrink-0 text-gray-500">英文名称</span>
                    <span className="font-medium text-gray-900">{hotel.english_name || "-"}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="w-20 shrink-0 text-gray-500">星级</span>
                    <span className="flex items-center gap-0.5">
                      {hotel.star ? (
                        Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < hotel.star ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`}
                          />
                        ))
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span className="w-20 shrink-0 text-gray-500">城市</span>
                    <span className="font-medium text-gray-900">{hotel.city || "-"}</span>
                  </div>
                  <div className="col-span-2 flex gap-2">
                    <span className="flex w-20 shrink-0 items-start gap-1 text-gray-500">
                      <MapPin className="mt-0.5 h-3.5 w-3.5" />
                      详细地址
                    </span>
                    <span className="font-medium text-gray-900">{hotel.address || "-"}</span>
                  </div>
                  <div className="col-span-2 flex gap-2">
                    <span className="w-20 shrink-0 text-gray-500">酒店简介</span>
                    <span className="leading-relaxed text-gray-700">{hotel.description || "-"}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="w-20 shrink-0 text-gray-500">商户名</span>
                    <span className="font-medium text-gray-900">{hotel.owner_name || "-"}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="w-20 shrink-0 text-gray-500">开业时间</span>
                    <span className="font-medium text-gray-900">{hotel.open_date || "-"}</span>
                  </div>
                </div>
              </section>

              {/* 区块2：酒店设施 */}
              <section>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  <Wifi className="h-4 w-4" />
                  酒店设施
                </h3>
                {facilities.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {facilities.map((f) => (
                      <Badge key={f} variant="secondary" className="px-3 py-1 text-sm">
                        {f}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">暂无设施信息</p>
                )}
              </section>

              {/* 区块3：图片相册 */}
              <section>
                <h3 className="mb-3 text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  图片相册
                </h3>
                <div className="space-y-3">
                  {/* 封面图 */}
                  <div>
                    <p className="mb-2 text-xs text-gray-400">封面图</p>
                    {hotel.cover_image ? (
                      <img
                        src={hotel.cover_image}
                        alt="封面"
                        className="h-40 w-64 rounded-lg border object-cover shadow-sm"
                      />
                    ) : (
                      <div className="flex h-40 w-64 items-center justify-center rounded-lg border bg-gray-100 text-sm text-gray-400">
                        暂无封面图
                      </div>
                    )}
                  </div>
                  {/* 详情图 */}
                  {detailImages.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs text-gray-400">详情轮播图（{detailImages.length} 张）</p>
                      <div className="flex flex-wrap gap-3">
                        {detailImages.map((url, i) => (
                          <img
                            key={i}
                            src={url}
                            alt={`详情图${i + 1}`}
                            className="h-28 w-28 rounded-lg border object-cover shadow-sm"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* 区块4：房型列表 */}
              <section>
                <h3 className="mb-3 text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  房型列表
                </h3>
                {rooms.length > 0 ? (
                  <div className="rounded-lg border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="text-xs">房型名称</TableHead>
                          <TableHead className="text-xs">床型</TableHead>
                          <TableHead className="text-xs text-right">面积</TableHead>
                          <TableHead className="text-xs text-right">库存</TableHead>
                          <TableHead className="text-xs text-right">价格</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rooms.map((room, i) => (
                          <TableRow key={room.id ?? i}>
                            <TableCell className="text-sm font-medium">{room.name || "-"}</TableCell>
                            <TableCell className="text-sm text-gray-600">{room.bed_info || "-"}</TableCell>
                            <TableCell className="text-sm text-right text-gray-600">{room.area ? `${room.area} m²` : "-"}</TableCell>
                            <TableCell className="text-sm text-right text-gray-600">{room.stock ?? "-"}</TableCell>
                            <TableCell className="text-sm text-right font-medium text-gray-900">
                              {room.price ? `¥${room.price}/晚` : "-"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">暂无房型数据</p>
                )}
              </section>

            </div>
          ) : (
            <p className="py-12 text-center text-sm text-gray-400">暂无数据</p>
          )}
        </div>

        <DialogFooter className="shrink-0 border-t px-6 py-4">
          <Button onClick={onClose}>关闭</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ===================== 主页面 =====================
export function HotelReviewPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(false);

  const [searchName, setSearchName] = useState("");
  const [searchOwnerName, setSearchOwnerName] = useState("");
  const [filterStatus, setFilterStatus] = useState<HotelStatus | undefined>(undefined);
  const [filterCity, setFilterCity] = useState<string | undefined>(undefined);

  // 前端分页
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // 详情弹窗
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [detailHotel, setDetailHotel] = useState<Hotel | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // 其他弹窗
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [offlineDialogOpen, setOfflineDialogOpen] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [viewReasonDialogOpen, setViewReasonDialogOpen] = useState(false);

  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // 接受显式传入的 filter，避免 setState 异步导致重置时读到旧值
  const fetchHotels = async (filter: HotelListFilter = {}) => {
    setLoading(true);
    try {
      const res = await getHotels(filter);
      if (!res.success) throw new Error(res.msg || "获取失败");
      setHotels(res.data ?? []);
    } catch (e: unknown) {
      toast.error("获取酒店列表失败", {
        description: e instanceof Error ? e.message : "请稍后重试",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async () => {
    setPage(1);
    await fetchHotels({
      hotelName: searchName.trim() || undefined,
      merchantName: searchOwnerName.trim() || undefined,
      status: filterStatus,
      city: filterCity,
    });
  };

  const handleReset = async () => {
    setSearchName("");
    setSearchOwnerName("");
    setFilterStatus(undefined);
    setFilterCity(undefined);
    setPage(1);
    // 直接传空 filter，不依赖 state 更新
    await fetchHotels({});
  };

  // 打开详情弹窗并拉取完整数据
  const openDetailDialog = async (hotel: Hotel) => {
    setDetailDialogOpen(true);
    setDetailHotel(null);
    setDetailLoading(true);
    try {
      const res = await getAdminHotelDetail(hotel.id);
      if (!res.success) throw new Error(res.msg || "获取详情失败");
      setDetailHotel(res.data);
    } catch (e: unknown) {
      toast.error("获取酒店详情失败", {
        description: e instanceof Error ? e.message : "请稍后重试",
      });
      setDetailDialogOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const doAudit = async (hotelId: number, auditStatus: AuditStatus) => {
    try {
      const res = await auditHotel(hotelId, auditStatus);
      if (!res.success) throw new Error(res.msg || "操作失败");
      setHotels((prev) => prev.filter((h) => h.id !== hotelId));
      return true;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "请稍后重试";
      toast.error("操作失败", { description: msg });
    }
  };

  const handleApprove = async (hotel: Hotel) => {
    const ok = await doAudit(hotel.id, 1);
    if (ok) toast.success("审核通过", { description: `${hotel.name} 已审核通过` });
  };

  const handleReject = async () => {
    if (!selectedHotel) return;
    if (!rejectionReason.trim()) {
      toast.error("请填写不通过原因");
      return;
    }
    const ok = await doAudit(selectedHotel.id, 2);
    if (ok) {
      toast.success("已标记为不通过", { description: `${selectedHotel.name} 已标记为不通过` });
      setRejectDialogOpen(false);
      setRejectionReason("");
      setSelectedHotel(null);
    }
  };

  const handleOffline = async () => {
    if (!selectedHotel) return;
    const ok = await doAudit(selectedHotel.id, 2);
    if (ok) {
      toast.success("已下线", { description: `${selectedHotel.name} 已下线` });
      setOfflineDialogOpen(false);
      setSelectedHotel(null);
    }
  };

  const handleRestore = async () => {
    if (!selectedHotel) return;
    const ok = await doAudit(selectedHotel.id, 1);
    if (ok) {
      toast.success("已恢复上线", { description: `${selectedHotel.name} 已恢复上线` });
      setRestoreDialogOpen(false);
      setSelectedHotel(null);
    }
  };

  const totalPages = Math.ceil(hotels.length / pageSize) || 1;
  const displayHotels = hotels.slice((page - 1) * pageSize, page * pageSize);

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
                {displayHotels.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-gray-500">
                      暂无数据
                    </TableCell>
                  </TableRow>
                ) : (
                  displayHotels.map((hotel) => (
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
                                onClick={() => {
                                  setSelectedHotel(hotel);
                                  setRejectionReason("");
                                  setRejectDialogOpen(true);
                                }}
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
                                onClick={() => {
                                  setSelectedHotel(hotel);
                                  setViewReasonDialogOpen(true);
                                }}
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
                              onClick={() => {
                                setSelectedHotel(hotel);
                                setOfflineDialogOpen(true);
                              }}
                              className="text-orange-600 hover:text-orange-700"
                            >
                              下线
                            </Button>
                          )}
                          {hotel.status === "offline" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedHotel(hotel);
                                setRestoreDialogOpen(true);
                              }}
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
            <div>当前页：{page} / {totalPages}</div>
            <div>共 {hotels.length} 条，本页 {displayHotels.length} 条</div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={loading || page <= 1}
              >
                上一页
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={loading || page >= totalPages}
              >
                下一页
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 酒店详情弹窗 */}
      <HotelDetailDialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        hotel={detailHotel}
        loading={detailLoading}
      />

      {/* 不通过原因填写弹窗 */}
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
