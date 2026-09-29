# Schema Google Sheets đề xuất

Khi chuyển từ demo local sang dữ liệu thật, dùng 1 Google Spreadsheet trung tâm với các sheet:

## HOC_VIEN
`MSHV | HO_DEM | TEN | NGAY_SINH | NGANH | LOP_VAN_HOA | LOP_NGHE | TRANG_THAI | GHI_CHU | UPDATED_AT`

- `MSHV` là khóa chính, không đổi.
- Không xóa học viên đã phát sinh lịch sử; đổi `TRANG_THAI`.

## DM_LOP
`MA_LOP | TEN_LOP | KHOA | NGANH | NAM_HOC | KHU_VUC | SI_SO_DU_KIEN | GV_PHU_TRACH | TRANG_THAI`

## DM_GIAO_VIEN
`MA_GV | HO_TEN | CHUYEN_MON | TRANG_THAI`

## DM_MON_HOC
`MA_MON | TEN_MON | NGANH | SO_TIET | LY_THUYET | THUC_HANH | HOC_KY | MON_TIEN_QUYET | TRANG_THAI`

## DM_PHONG
`MA_PHONG | TEN_PHONG | LOAI | SUC_CHUA | DIA_DIEM | TRANG_THAI`

## LOG_CHINH_SUA
`LOG_ID | THOI_GIAN | NGUOI_DUNG | DOI_TUONG | MA_DOI_TUONG | TRUONG | GIA_TRI_CU | GIA_TRI_MOI | LY_DO`

Người dùng web không được sửa trực tiếp các sheet dữ liệu gốc khi hệ thống chạy thật.
