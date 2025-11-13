-- Create table for completed work orders
CREATE TABLE public.completed_work_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wo_number TEXT NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  total_duration INTEGER NOT NULL, -- duration in seconds
  images TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.completed_work_orders ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Anyone can view completed work orders" 
ON public.completed_work_orders 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create completed work orders" 
ON public.completed_work_orders 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can delete completed work orders" 
ON public.completed_work_orders 
FOR DELETE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_completed_work_orders_updated_at
BEFORE UPDATE ON public.completed_work_orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster date queries
CREATE INDEX idx_completed_work_orders_completed_at ON public.completed_work_orders(completed_at DESC);