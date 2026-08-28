import { Link } from "react-router";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen flex flex-col items-center justify-center bg-background px-4"
    >
      <h1 className="text-6xl font-extrabold tracking-tight text-foreground">404</h1>
      <p className="mt-2 text-lg text-muted-foreground">Halaman tidak ditemukan</p>
      <Button asChild variant="outline" size="sm" className="mt-6 rounded-full">
        <Link to="/">
          <ArrowLeft className="size-4" />
          Kembali ke Beranda
        </Link>
      </Button>
    </motion.div>
  );
}
