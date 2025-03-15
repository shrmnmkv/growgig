
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ButtonLinkProps = {
  children: React.ReactNode;
  to: string;
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  onClick?: () => void;
};

const ButtonLink = ({
  children,
  to,
  className,
  variant = 'default',
  size = 'default',
  onClick,
}: ButtonLinkProps) => {
  return (
    <Link to={to} className="inline-block" onClick={onClick}>
      <Button 
        variant={variant} 
        size={size} 
        className={cn(className)}
      >
        {children}
      </Button>
    </Link>
  );
};

export default ButtonLink;
