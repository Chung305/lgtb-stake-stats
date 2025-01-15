'use client'
import { ThemeModeToggle } from "@/components/ThemeModeToggle";
import { WalletAddressForm } from "@/components/WalletAddressForm";
import { deriveFeeVault } from "@/lib/Web3";
//import { useState } from "react";
//import Image from "next/image";

export default function Home() {


  const vault = deriveFeeVault();

  //console.log(vaultAddress.toBase58());
  console.log(vault.toBase58());

  const handleAddressSubmit = async (address: string) => {

    console.log(address);
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <ThemeModeToggle />


      <WalletAddressForm onSubmit={handleAddressSubmit} />
    </div>
  );
}
