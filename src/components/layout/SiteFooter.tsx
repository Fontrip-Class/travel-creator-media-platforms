import { Link } from "react-router-dom";

const SiteFooter = () => {
  return (
    <footer className="border-t mt-16">
      <div className="container py-10 grid gap-8 md:grid-cols-3">
        <section>
          <h3 className="font-semibold mb-3">關於平台</h3>
          <p className="text-sm text-muted-foreground">
            觀光署旅遊服務與行銷創作資源管理與媒合平台
          </p>
        </section>
        <nav className="grid gap-2">
          <h3 className="font-semibold mb-3">快速連結</h3>
          <Link to="/suppliers" className="text-sm text-muted-foreground hover:text-foreground">供應商</Link>
          <Link to="/creators" className="text-sm text-muted-foreground hover:text-foreground">創作者</Link>
          <Link to="/media" className="text-sm text-muted-foreground hover:text-foreground">媒體資源</Link>
        </nav>
        <section id="contact">
          <h3 className="font-semibold mb-3">聯絡資訊</h3>
          <p className="text-sm text-muted-foreground">Email: hello@example.com</p>
        </section>
      </div>
      <div className="border-t">
        <div className="container py-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Travel Creator Media Hub
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
