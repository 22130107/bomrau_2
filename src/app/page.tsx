import { ProductCard } from "@/components/ProductCard";
import { ContactButton } from "@/components/ContactButton";
import { SearchBar } from "@/components/SearchBar";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export const revalidate = 0; // Dynamic rendering

export default async function Home({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  
  let query = `
    SELECT id, title, image_url, price, original_price, discount_percent 
    FROM products 
    WHERE status = 'available'
  `;
  const params: any[] = [];

  if (q) {
    query += " AND (title LIKE ? OR pet_tim LIKE ? OR san_tim LIKE ? OR chuong LIKE ?)";
    const likeQ = `%${q}%`;
    params.push(likeQ, likeQ, likeQ, likeQ);
  }

  query += " ORDER BY is_pinned DESC, price ASC, id DESC";

  const [products] = await pool.query<RowDataPacket[]>(query, params);

  return (
    <div className="min-h-screen text-white font-[family-name:var(--font-nunito)] bg-[rgb(15,23,42)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start pt-10">
        <section className="pt-6 md:pt-10 pb-6 md:pb-10 w-full">
          <div className="mx-auto w-full max-w-[1200px] px-[14px]">
            <h2 className="font-bold mb-[24px] text-center text-[rgb(251,191,36)] text-[28px] md:text-[36px] leading-[48px] md:leading-[64px] animate-fade-in-up">
              Sản Phẩm Nổi Bật
            </h2>
            
            <SearchBar />

            {products.length === 0 ? (
              <p className="text-center text-[rgba(238,238,238,0.6)] animate-fade-in-up">Không tìm thấy sản phẩm nào phù hợp.</p>
            ) : (
              <ul className="flex flex-wrap justify-center gap-[16px] md:gap-[32px] mt-8 animate-fade-in-up">
                {products.map(p => (
                  <ProductCard 
                    key={p.id} 
                    id={p.id.toString()}
                    name={p.title}
                    image={p.image_url || "https://via.placeholder.com/600x400/111827/fcd34d?text=No+Image"}
                    price={Number(p.price)}
                    originalPrice={Number(p.original_price)}
                    discount={Number(p.discount_percent)}
                    href={`/product/${p.id}`}
                  />
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>
      <ContactButton link="https://facebook.com" />
    </div>
  );
}
