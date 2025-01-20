'use client'
import { VaultOptions, VaultSelection } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { calculateStakedPercentage, formatNumberWithCommas } from "@/lib/utils";
import { useEffect, useState } from "react";
import { getTokenMetaData } from "@/lib/Web3";
import { getVaultInfo } from "@/lib/Web3";
import { Selector } from "./Selector";
import { StatsCard } from "../StatsCard";
import Image from "next/image";
import { IconLinks } from "./links-top/IconLinks";
import { useVault } from "../providers/VaultDataProvider";
import { HeadPriceDisplay } from "../HeadPriceDisplay";
import { useActivityDetection } from "@/hooks/useActivityDetection";

interface VaultStatsProps {
    vaultOptions: VaultOptions[];
    onVaultSelect: (vault: VaultSelection) => void;
    selectedVault?: string;
}
export default function VaultStats({
    vaultOptions,
    onVaultSelect,
    selectedVault,
}: VaultStatsProps) {
    const { tokenData, setTokenData, vaultData, setVaultData } = useVault();
    const [previousValue, setPreviousValue] = useState<number | null>(null);
    const [lastCheckedPrice, setLastCheckedPrice] = useState<number | null>(null);
    const isActive = useActivityDetection(120000);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    useEffect(() => {
        if (!selectedVault) return;
        let mounted = true;
        let intervalId: NodeJS.Timeout | null = null;

        const fetchVaultInfo = async () => {
            if (!isActive) return;
            try {
                const vault = await getVaultInfo(selectedVault);
                if (mounted) {
                    setVaultData(vault);
                    console.log(vault);
                }
            } catch (error) {
                console.error("Error fetching vault data:", error);
                if (mounted) {
                    setVaultData(null);
                }
            } finally {
                if (mounted && isInitialLoad) {
                    setIsInitialLoad(false);
                }
            }
        };

        if (isActive) {
            fetchVaultInfo();
            intervalId = setInterval(fetchVaultInfo, 10000);
        }

        return () => {
            mounted = false;
            if (intervalId) clearInterval(intervalId);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isInitialLoad, selectedVault, isActive]);

    useEffect(() => {
        if (!vaultData?.token_a_mint) return;
        let mounted = true;
        let intervalId: NodeJS.Timeout | null = null;

        const fetchTokenInfo = async () => {
            if (!isActive) return;
            try {
                const token = await getTokenMetaData(vaultData.token_a_mint);
                if (mounted) {
                    setTokenData(token);
                }
            } catch (error) {
                console.error("Error fetching token data:", error);
                if (mounted) {
                    setTokenData(null);
                }
            } finally {
                if (mounted && isInitialLoad) {
                    setIsInitialLoad(false);
                }
            }
        };

        if (isActive) {
            fetchTokenInfo();
            intervalId = setInterval(fetchTokenInfo, 10000);
        }

        return () => {
            mounted = false;
            if (intervalId) clearInterval(intervalId);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isInitialLoad, vaultData?.token_a_mint, isActive]);

    useEffect(() => {
        if (tokenData?.tokenPrice) {
            const currentPrice = Number(tokenData.tokenPrice);
            if (lastCheckedPrice !== null && currentPrice !== lastCheckedPrice) {
                setPreviousValue(lastCheckedPrice);
            }
            setLastCheckedPrice(currentPrice);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tokenData?.tokenPrice]);

    const vaultRewardsStats = [
        {
            label: `${vaultData?.token_a_symbol} Rewards USD`,
            value: `$${formatNumberWithCommas(vaultData?.current_reward_token_a_usd.toFixed(4))}`,
        },
        {
            label: `${vaultData?.token_b_symbol} Rewards USD`,
            value: `$${formatNumberWithCommas(vaultData?.current_reward_token_b_usd.toFixed(4))}`,
        },
        {
            label: `Total USD Rewards`,
            value: `$${formatNumberWithCommas(vaultData?.current_reward_usd.toFixed(2))}`,
        },
        {
            label: `Daily Rewards`,
            value: `$${formatNumberWithCommas(vaultData?.daily_reward_usd.toFixed(2))}`,
        },

    ];
    const tokenStats = [
        {
            label: `${vaultData?.token_a_symbol} USD Price`,
            value: `$${tokenData?.tokenPrice}`,
        },
        {
            label: `Market Cap`,
            value: `$${formatNumberWithCommas(
                tokenData?.token_info?.supply && tokenData?.tokenPrice && tokenData?.token_info?.decimals
                    ? (Number(tokenData.token_info.supply) / Math.pow(10, tokenData.token_info.decimals)) * tokenData.tokenPrice
                    : 0
            )}`,
        }
    ]

    const vaultTokenStats = [
        {
            label: `Total Staked`,
            value: `${formatNumberWithCommas(vaultData?.total_staked_amount)}`,
        },
        {
            label: `Total Staked USD`,
            value: `$${formatNumberWithCommas(vaultData?.total_staked_amount_usd.toFixed(2))}`,
        },
        {
            label: `Total Staked Percentage`,
            value: `${calculateStakedPercentage(
                Number(vaultData?.total_staked_amount),
                Number(tokenData?.token_info?.supply),
                tokenData?.token_info?.decimals,
                2)}%`,
        },
    ]


    return (
        <div>
            <div className="flex row gap-1 justify-end">
                <HeadPriceDisplay />
                <Selector
                    options={vaultOptions}
                    placeholder="Select an option"
                    onSelect={onVaultSelect}
                />
            </div>

            {selectedVault && (isInitialLoad ? (
                <div>Loading...</div>
            ) : (
                <div className="space-y-2 mt-2">
                    <Card>
                        <CardContent className="p-2 relative">
                            <div className="flex justify-between">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                    <Image
                                        src={tokenData?.content.links.image || '/default-image.png'}
                                        alt={tokenData?.content.metadata.name || 'Default Alt Text'}
                                        width={100}
                                        height={100}
                                        className="w-16 h-16 rounded-full"
                                    />
                                    <div>
                                        <CardTitle className="text-lg">
                                            {tokenData?.content.metadata.name}
                                        </CardTitle>
                                        <p className="text-sm text-muted-foreground">Token Analytics</p>
                                        <IconLinks poolAddress={vaultData?.pool_address} tokenSymbol={vaultData?.token_a_symbol} />
                                    </div>
                                </div>
                                {vaultData?.token_a_symbol.includes('LGTB') && (
                                    <Image
                                        src='/lgtb-meme.png'
                                        alt='LGTB Meme'
                                        width={140}
                                        height={140}
                                        className="absolute right-0 top-1"
                                    />)}
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 mt-4">
                                {tokenStats.map((stat, index) => (
                                    <StatsCard key={index} label={stat.label} value={stat.value} currentPrice={Number(tokenData?.tokenPrice)} previousValue={previousValue} />
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="p-2">
                            <CardTitle className="text-lg">Vault Metrics</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                                {vaultTokenStats.map((stat, index) => (
                                    <StatsCard key={index} label={stat.label} value={stat.value} />
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-2">
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                                {vaultRewardsStats.map((stat, index) => (
                                    <StatsCard key={index} label={stat.label} value={stat.value} />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

            ))}
        </div>

    )
}