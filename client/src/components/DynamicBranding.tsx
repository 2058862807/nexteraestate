import { useState, useEffect } from 'react';
import { Shield, Zap } from 'lucide-react';

interface BrandConfig {
  name: string;
  icon: typeof Shield;
  tagline: string;
  primaryColor: string;
  description: string;
}

const brandConfigs: Record<string, BrandConfig> = {
  'nodoubtestate': {
    name: 'NoDoubtEstate',
    icon: Shield,
    tagline: 'Secure Your Family\'s Future',
    primaryColor: 'text-blue-600',
    description: 'Revolutionary AI-powered digital estate planning platform with blockchain security and advanced family coordination.'
  },
  'nexteraestate': {
    name: 'NextEra Estate',
    icon: Zap,
    tagline: 'The Future of Estate Planning',
    primaryColor: 'text-green-600',
    description: 'Next-generation estate planning made simple with cutting-edge AI technology and streamlined processes.'
  }
};

export function useBrandConfig() {
  const [brandConfig, setBrandConfig] = useState<BrandConfig>(brandConfigs.nexteraestate);

  useEffect(() => {
    const hostname = window.location.hostname.toLowerCase();
    
    if (hostname.includes('nextera') || hostname.includes('nexteraestate')) {
      setBrandConfig(brandConfigs.nexteraestate);
    } else {
      setBrandConfig(brandConfigs.nexteraestate); // Default to NextEraEstate
    }
  }, []);

  return brandConfig;
}

export function BrandLogo({ className = "" }: { className?: string }) {
  const brand = useBrandConfig();
  const IconComponent = brand.icon;

  return (
    <div className={`flex items-center ${className}`}>
      <IconComponent className={`h-8 w-8 mr-3 ${brand.primaryColor}`} />
      <span className="font-bold text-xl text-neutral-800">{brand.name}</span>
    </div>
  );
}

export function BrandHero() {
  const brand = useBrandConfig();

  return (
    <div className="text-center">
      <h1 className="text-4xl md:text-6xl font-bold text-neutral-800 mb-6">
        {brand.tagline}
      </h1>
      <p className="text-xl text-neutral-600 mb-8 max-w-3xl mx-auto">
        {brand.description}
      </p>
    </div>
  );
}