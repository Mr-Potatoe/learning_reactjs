"use client";

import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import ScrollProgress from "@/components/ScrollProgress";

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
}

export default function MainPage() {
  const [message, setMessage] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[] | null>(null);

  useEffect(() => {
    fetch("/api/message")
      .then((response) => {
        if (response.ok) toast.success("Fetched successfully");
        else throw new Error("Failed to fetch");
        return response.json();
      })
      .then((data) => setMessage(data.message))
      .catch((error) => toast.error(error.message));
  }, []);

  useEffect(() => {
    fetch("/api/products")
      .then((response) => {
        if (response.ok) toast.success("Products successfully fetched");
        else throw new Error("Failed to fetch products");
        return response.json();
      })
      .then((data) => setProducts(data.products))
      .catch((error) => toast.error(error.message));
  }, []);

  const handleButtonClick = () => {
    toast.info("Hello, world!");
  };

  const items = [
    { id: 1, name: "Item 1" },
    { id: 2, name: "Item 2" },
    { id: 3, name: "Item 3" },
  ];

  const MotionButton = motion(Button);
  const MotionLi = motion.li;


  return (
    <>
      <ScrollProgress />

      <main className="p-10 space-y-10">
        <header className="p-4">
          <h1 className="text-2xl font-bold">Hello, world!</h1>

          <MotionButton
            whileTap={{ scale: 0.95 }}
            className="font-bold py-2 px-4"
            onClick={handleButtonClick}
          >
            Button
          </MotionButton>

          <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 text-3xl">
            {items?.map((item) => (
              <li
                key={item.id}
              >
                {item.name}
              </li>
            ))}
          </ul>

          <p className="mt-4">{message}</p>

          <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 text-xl">
            {products?.map((product) => (
              <MotionLi
                key={product.id}
                className="border p-4 rounded"
                whileHover={{ scale: 1.05 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                <h2 className="font-bold">{product.name}</h2>
                <p>{product.description}</p>
                <p className="font-semibold text-blue-600">${product.price}</p>
              </MotionLi>
            ))}
          </ul>
        </header>
      </main>
      <motion.div
            animate={{
                scale: [1, 2, 2, 1, 1],
                rotate: [0, 0, 180, 180, 0],
                borderRadius: ["0%", "0%", "50%", "50%", "0%"],
            }}
            transition={{
                duration: 2,
                ease: "easeInOut",
                times: [0, 0.2, 0.5, 0.8, 1],
                repeat: Infinity,
                repeatDelay: 1,
            }}
            className="w-24 h-24 bg-chart-3 rounded-lg"
        />
    </>

  );
}
