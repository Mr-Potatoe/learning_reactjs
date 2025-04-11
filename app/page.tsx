"use client"
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

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
        if (response.ok) {
          toast.success("Fetched successfully");
        }
        if (!response.ok) {
          throw new Error("Failed to fetch");
        }
        return response.json();
      })
      .then((data) => setMessage(data.message))
      .catch((error) => toast.error(error.message));
  }, []);

  useEffect(() => {
    fetch("/api/products")
     .then((response) => {
      if (response.ok) {
        toast.success("products successfully fetched");
      }
      if (!response.ok) {
        toast.error("Failed to fetch products");
      }
       return response.json(); })
     .then((data) => setProducts(data.products))
     .catch((error) => toast.error(error.message));
  }, []);

  const handleButtonClick = () => {
    toast.warning('Hello, world!');
  };

  const items = [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
    { id: 3, name: 'Item 3' },
  ];


  return (
    <>
      <header className="p-4">
        <h1 className="text-2xl font-bold">Hello, world!</h1>
        <Button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={handleButtonClick}>
          Button
        </Button>
        <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 text-3xl">
          {items?.map(item => (
            <li key={item.id}>{item.name}</li>
          ))}
        </ul>
        <p>{message}</p>
        <ul>
          {products?.map((product) => (
            <li key={product.id}>
              <h2>{product.name}</h2>
              <p>{product.description}</p>
              <p>{product.price}</p>
            </li>
          ))}
        </ul>
      </header>
    </>
  );
}
