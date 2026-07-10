import { ProductDetail } from "@/components/ProductDetail";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { notFound } from "next/navigation";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [products] = await pool.query<RowDataPacket[]>(`
    SELECT id, title, image_url, price, original_price, discount_percent,
           pet_tim, san_tim, chuong, extra_info
    FROM products
    WHERE id = ? AND status = 'available'
  `, [id]);

  if (products.length === 0) {
    notFound();
  }

  const product = products[0];

  const [imageRows] = await pool.query<RowDataPacket[]>(
    "SELECT image_url FROM product_images WHERE product_id = ? ORDER BY sort_order, id",
    [id]
  );
  
  const productImages: string[] = imageRows.length > 0
    ? imageRows.map((r) => r.image_url as string)
    : (product.image_url ? [product.image_url] : []);

  const [accounts] = await pool.query<RowDataPacket[]>(
    "SELECT COUNT(*) as count FROM accounts WHERE product_id = ? AND status = 'available'",
    [id]
  );
  const realRemainingCount = accounts[0].count;

  return (
    <div>
      <main className="min-h-screen text-white font-[family-name:var(--font-nunito)] bg-[rgb(15,23,42)]">
        <div className="pt-6 md:pt-10 pb-10">
          <ProductDetail
            productId={product.id}
            name={product.title}
            image={product.image_url || ""}
            images={productImages}
            price={Number(product.price)}
            originalPrice={Number(product.original_price)}
            discount={Number(product.discount_percent)}
            petTim={product.pet_tim || undefined}
            sanTim={product.san_tim || undefined}
            chuong={product.chuong || undefined}
            extraInfo={product.extra_info || undefined}
            isOutOfStock={realRemainingCount === 0}
          />
        </div>
      </main>
    </div>
  );
}
