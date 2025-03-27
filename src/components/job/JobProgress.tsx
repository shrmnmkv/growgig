import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobProgressService } from '@/services/jobProgressService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { formatDate } from '@/lib/utils';
import { CircleCheckBig, Edit, Plus, Trash2, DollarSign, Unlock } from 'lucide-react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { CreditCard, Calendar, Lock } from 'lucide-react';

interface JobProgressProps {
  applicationId: string;
  isEmployer: boolean;
}

export const JobProgress: React.FC<JobProgressProps> = ({ applicationId, isEmployer }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingMilestones, setEditingMilestones] = useState<Array<{
    title: string;
    description: string;
    dueDate: string;
    amount: number;
    status: 'pending' | 'in_progress' | 'completed' | 'paid';
  }>>([]);
  const [showFundDialog, setShowFundDialog] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    upiId: '',
    payerName: '',
    paymentMethod: 'upi' // Default to UPI
  });
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [showSubmitWorkDialog, setShowSubmitWorkDialog] = useState(false);
  const [currentMilestoneIndex, setCurrentMilestoneIndex] = useState<number | null>(null);
  const [workSubmissionUrl, setWorkSubmissionUrl] = useState('');
  const [currentFundingMilestoneIndex, setCurrentFundingMilestoneIndex] = useState<number | null>(null);

  const { data: jobProgress, isLoading, refetch } = useQuery({
    queryKey: ['jobProgress', applicationId],
    queryFn: async () => {
      try {
        const result = await jobProgressService.getByApplicationId(applicationId);
        console.log('Job progress result:', result);
        return result;
      } catch (error) {
        console.error('Error fetching job progress:', error);
        return null;
      }
    },
  });

  const updateMilestoneMutation = useMutation({
    mutationFn: (params: {
      jobProgressId: string;
      milestoneIndex: number;
      data: {
        status: 'in_progress' | 'completed' | 'paid';
        submissionUrl?: string;
        feedback?: string;
      };
    }) => jobProgressService.updateMilestone(
      params.jobProgressId,
      params.milestoneIndex,
      params.data
    ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobProgress', applicationId] });
      toast({
        title: 'Success',
        description: 'Milestone status updated successfully',
      });
      setSubmissionUrl('');
      setFeedback('');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update milestone status',
        variant: 'destructive',
      });
    },
  });

  const addRatingMutation = useMutation({
    mutationFn: (params: {
      jobProgressId: string;
      data: {
        rating: number;
        review: string;
        type: 'employer' | 'freelancer';
      };
    }) => jobProgressService.addRating(params.jobProgressId, params.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobProgress', applicationId] });
      toast({
        title: 'Success',
        description: 'Rating added successfully',
      });
      setRating(0);
      setReview('');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to add rating',
        variant: 'destructive',
      });
    },
  });

  const fundEscrowMutation = useMutation({
    mutationFn: (params: { jobProgressId: string; amount: number; milestoneIndex: number }) =>
      jobProgressService.fundMilestoneEscrow(params.jobProgressId, params.milestoneIndex, params.amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobProgress', applicationId] });
      setShowFundDialog(false);
      toast({
        title: 'Success',
        description: 'Milestone escrow funded successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to fund milestone escrow',
        variant: 'destructive',
      });
    },
  });

  const releaseEscrowMutation = useMutation({
    mutationFn: (params: { jobProgressId: string; milestoneIndex: number; feedback?: string }) =>
      jobProgressService.releaseEscrow(params.jobProgressId, params.milestoneIndex, params.feedback),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobProgress', applicationId] });
      toast({
        title: 'Success',
        description: 'Payment released successfully',
      });
      setFeedback('');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to release payment',
        variant: 'destructive',
      });
    },
  });

  const handleUpdateMilestone = async (milestoneIndex: number, status: 'in_progress' | 'completed' | 'paid', newSubmissionUrl?: string, newFeedback?: string) => {
    try {
      if (!jobProgress) return;

      await jobProgressService.updateMilestone(jobProgress._id, milestoneIndex, {
        status,
        submissionUrl: newSubmissionUrl,
        feedback: newFeedback,
      });

      toast({
        title: 'Success',
        description: 'Milestone updated successfully.',
      });

      refetch();
      setSubmissionUrl('');
      setFeedback('');
    } catch (error) {
      console.error('Error updating milestone:', error);
      toast({
        title: 'Error',
        description: 'Failed to update milestone.',
        variant: 'destructive',
      });
    }
  };

  const handleAddRating = () => {
    if (!jobProgress || !rating || !review) {
      toast({
        title: 'Error',
        description: 'Please provide both rating and review',
        variant: 'destructive',
      });
      return;
    }

    addRatingMutation.mutate({
      jobProgressId: jobProgress._id,
      data: {
        rating,
        review,
        type: user?.role === 'employer' ? 'employer' : 'freelancer',
      },
    });
  };

  const handleEditMilestones = () => {
    if (!jobProgress) return;
    setEditingMilestones(jobProgress.milestones.map(m => ({
      title: m.title,
      description: m.description,
      dueDate: new Date(m.dueDate).toISOString().split('T')[0],
      amount: m.amount,
      status: m.status
    })));
    setShowEditDialog(true);
  };

  const handleAddNewMilestone = () => {
    setEditingMilestones([...editingMilestones, {
      title: '',
      description: '',
      dueDate: '',
      amount: 0,
      status: 'pending'
    }]);
  };

  const handleRemoveMilestone = (index: number) => {
    const newMilestones = [...editingMilestones];
    newMilestones.splice(index, 1);
    setEditingMilestones(newMilestones);
  };

  const handleMilestoneChange = (index: number, field: string, value: string | number) => {
    const newMilestones = [...editingMilestones];
    newMilestones[index] = { ...newMilestones[index], [field]: value };
    setEditingMilestones(newMilestones);
  };

  const handleSaveMilestones = async () => {
    if (!jobProgress) return;

    try {
      // Validate milestones
      if (editingMilestones.some(m => !m.title || !m.description || !m.dueDate || !m.amount)) {
        toast({
          title: 'Error',
          description: 'Please fill in all milestone details.',
          variant: 'destructive',
        });
        return;
      }

      // Update job progress with new milestones
      await jobProgressService.updateMilestones(jobProgress._id, {
        milestones: editingMilestones.map(m => ({
          ...m,
          dueDate: new Date(m.dueDate).toISOString()
        }))
      });

      queryClient.invalidateQueries({ queryKey: ['jobProgress', applicationId] });
      setShowEditDialog(false);
      toast({
        title: 'Success',
        description: 'Milestones updated successfully.',
      });
    } catch (error) {
      console.error('Error updating milestones:', error);
      toast({
        title: 'Error',
        description: 'Failed to update milestones.',
        variant: 'destructive',
      });
    }
  };

  const handleFundEscrow = (milestoneIndex: number) => {
    if (!jobProgress) return;
    setCurrentFundingMilestoneIndex(milestoneIndex);
    setShowFundDialog(true);
  };

  const handlePaymentFormChange = (field: string, value: string) => {
    setPaymentForm({
      ...paymentForm,
      [field]: value
    });
  };

  const handleProcessPayment = async () => {
    if (!jobProgress || currentFundingMilestoneIndex === null) return;
    
    // Validate payment form
    if (!paymentForm.upiId || !paymentForm.payerName) {
      toast({
        title: 'Error',
        description: 'Please fill in all payment details',
        variant: 'destructive',
      });
      return;
    }

    // Validate UPI ID format
    const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;
    if (!upiRegex.test(paymentForm.upiId)) {
      toast({
        title: 'Error',
        description: 'Please enter a valid UPI ID (e.g., name@upi)',
        variant: 'destructive',
      });
      return;
    }

    // Start payment processing
    setPaymentProcessing(true);
    
    try {
      // Get the milestone amount
      const milestoneAmount = jobProgress.milestones[currentFundingMilestoneIndex].amount;
      
      // Simulate Razorpay integration
      console.log('Initiating Razorpay UPI payment:', {
        upiId: paymentForm.upiId,
        payerName: paymentForm.payerName,
        amount: milestoneAmount,
        currency: 'INR',
        jobId: jobProgress.jobId._id,
        milestoneId: currentFundingMilestoneIndex
      });

      // In a real implementation, you would:
      // 1. Call your backend to create a Razorpay order
      // 2. Initialize Razorpay payment window
      // 3. Handle the payment callback

      // Simulate network delay for now
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Process escrow funding for the specific milestone
      await fundEscrowMutation.mutateAsync({
        jobProgressId: jobProgress._id,
        milestoneIndex: currentFundingMilestoneIndex,
        amount: milestoneAmount
      });
      
      setShowFundDialog(false);
      
      // Reset form
      setPaymentForm({
        upiId: '',
        payerName: '',
        paymentMethod: 'upi'
      });
      setCurrentFundingMilestoneIndex(null);
      
      toast({
        title: 'Success',
        description: `Successfully funded escrow for milestone with ₹${milestoneAmount}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process payment',
        variant: 'destructive',
      });
    } finally {
      setPaymentProcessing(false);
    }
  };

  const handleReleaseEscrow = (milestoneIndex: number, feedback?: string) => {
    if (!jobProgress) return;
    releaseEscrowMutation.mutate({
      jobProgressId: jobProgress._id,
      milestoneIndex,
      feedback
    });
  };

  const handleWorkSubmission = async () => {
    if (!jobProgress || currentMilestoneIndex === null) return;

    try {
      if (!workSubmissionUrl) {
        toast({
          title: 'Error',
          description: 'Please provide a submission URL',
          variant: 'destructive',
        });
        return;
      }

      await updateMilestoneMutation.mutateAsync({
        jobProgressId: jobProgress._id,
        milestoneIndex: currentMilestoneIndex,
        data: {
          status: 'completed',
          submissionUrl: workSubmissionUrl,
        }
      });

      setShowSubmitWorkDialog(false);
      setWorkSubmissionUrl('');
      setCurrentMilestoneIndex(null);
      
      toast({
        title: 'Success',
        description: 'Work submitted successfully. Waiting for employer review.',
      });
    } catch (error) {
      console.error('Error submitting work:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit work. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const openSubmitWorkDialog = (index: number) => {
    setCurrentMilestoneIndex(index);
    setWorkSubmissionUrl('');
    setShowSubmitWorkDialog(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-growgig-500"></div>
      </div>
    );
  }

  if (!jobProgress) {
    return (
      <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
        <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Waiting for the employer to set up milestones
        </h3>
        <p className="text-gray-600">
          You'll be notified once they're ready.
        </p>
      </div>
    );
  }

  const completedMilestones = jobProgress.milestones.filter(m => m.status === 'completed' || m.status === 'paid').length;
  const totalMilestones = jobProgress.milestones.length;
  const progressPercentage = (completedMilestones / totalMilestones) * 100;

  // Custom progress bar that changes color based on completion percentage
  const getProgressColor = (percentage: number) => {
    if (percentage === 0) return 'bg-gray-200';
    if (percentage < 25) return 'bg-red-400';
    if (percentage < 50) return 'bg-yellow-400';
    if (percentage < 75) return 'bg-blue-400';
    return 'bg-green-500';
  };

  const canRate = jobProgress.status === 'completed' && (
    (user?.role === 'employer' && !jobProgress.rating?.fromEmployer) ||
    (user?.role === 'freelancer' && !jobProgress.rating?.fromFreelancer)
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Job Progress</CardTitle>
            <CardDescription>
              <div className="flex items-center gap-2">
                <span>Status:</span>
                <Badge>{jobProgress?.status}</Badge>
              </div>
              <div className="mt-2">
                <span className="font-medium">Job:</span> {jobProgress?.jobId.title}
              </div>
              <div>
                <span className="font-medium">Company:</span> {jobProgress?.jobId.company}
              </div>
              {jobProgress && (
                <div className="mt-2">
                  <span className="font-medium">Escrow Status:</span>{' '}
                  <Badge variant={jobProgress.escrowStatus === 'fully_funded' ? 'default' : 'secondary'}>
                    {jobProgress.escrowStatus.replace(/_/g, ' ').toUpperCase()}
                  </Badge>
                </div>
              )}
            </CardDescription>
          </div>
          {isEmployer && jobProgress && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleEditMilestones}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit Milestones
              </Button>
            </div>
          )}
        </div>
        {jobProgress && (
          <div className="mt-4">
            <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all ${getProgressColor(progressPercentage)}`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              {completedMilestones} of {totalMilestones} milestones completed ({Math.round(progressPercentage)}%)
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {jobProgress?.milestones.map((milestone, index) => (
            <Card key={index} className="border border-gray-200">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{milestone.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Due: {new Date(milestone.dueDate).toLocaleDateString()}
                    </p>
                    <div className="flex items-center mt-2">
                      <span className="font-medium mr-2">Status:</span>
                      <Badge className={
                        milestone.status === 'paid' 
                          ? 'bg-green-100 text-green-800' 
                          : milestone.status === 'completed' 
                          ? 'bg-blue-100 text-blue-800' 
                          : milestone.status === 'in_progress' 
                          ? 'bg-amber-100 text-amber-800' 
                          : 'bg-gray-100 text-gray-800'
                      }>
                        {milestone.status?.replace('_', ' ')}
                      </Badge>
                    </div>
                    {milestone.submissionUrl && (
                      <div className="mt-3">
                        <span className="font-medium">Submission:</span>{' '}
                        <a 
                          href={milestone.submissionUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          View Submission
                        </a>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold">${milestone.amount}</div>
                    {milestone.escrowStatus && (
                      <Badge className={
                        milestone.escrowStatus === 'released' 
                          ? 'bg-green-100 text-green-800' 
                          : milestone.escrowStatus === 'funded' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-gray-100 text-gray-800'
                      }>
                        {milestone.escrowStatus}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="mt-4">
                  <p className="text-gray-700">{milestone.description}</p>
                </div>

                {/* Add Fund Escrow button for each milestone */}
                {isEmployer && milestone.status !== 'paid' && (!milestone.escrowStatus || milestone.escrowStatus === 'not_funded') && (
                  <div className="mt-4">
                    <Button
                      onClick={() => handleFundEscrow(index)}
                      className="w-full bg-green-500 hover:bg-green-600"
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      Fund Escrow for this Milestone (${milestone.amount})
                    </Button>
                  </div>
                )}

                {isEmployer && milestone.status === 'completed' && milestone.escrowStatus === 'funded' && (
                  <div className="mt-4 space-y-4">
                    <Textarea
                      placeholder="Provide feedback on the submission"
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                    />
                    <Button
                      onClick={() => handleReleaseEscrow(index, feedback)}
                      className="w-full bg-green-500 hover:bg-green-600"
                      disabled={releaseEscrowMutation.isPending}
                    >
                      Release Payment from Escrow
                    </Button>
                  </div>
                )}

                {!isEmployer && (milestone.status === 'pending' || milestone.status === 'in_progress') && milestone.escrowStatus === 'funded' && (
                  <div className="mt-4">
                    <Button
                      onClick={() => openSubmitWorkDialog(index)}
                      className="w-full bg-blue-500 hover:bg-blue-600"
                    >
                      {milestone.status === 'pending' ? 'Start Work & Submit' : 'Submit Work for Review'}
                    </Button>
                  </div>
                )}

                {!isEmployer && milestone.status === 'completed' && milestone.escrowStatus === 'funded' && (
                  <div className="mt-4 text-center py-2 bg-yellow-50 text-yellow-800 rounded-md text-sm">
                    Awaiting employer review
                  </div>
                )}

                {!isEmployer && milestone.status === 'paid' && (
                  <div className="mt-4 text-center py-2 bg-green-50 text-green-800 rounded-md text-sm">
                    Payment received
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
      {canRate && (
        <CardFooter className="flex flex-col gap-4">
          <div className="w-full space-y-4">
            <div className="flex items-center gap-2">
              <span>Rating:</span>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                >
                  ★
                </button>
              ))}
            </div>
            <Textarea
              placeholder="Write your review"
              value={review}
              onChange={(e) => setReview(e.target.value)}
            />
            <Button
              onClick={handleAddRating}
              disabled={addRatingMutation.isPending}
            >
              Submit Review
            </Button>
          </div>
        </CardFooter>
      )}

      {/* Add Edit Milestones Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Milestones</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {editingMilestones.map((milestone, index) => (
              <Card key={index} className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-sm font-medium">Milestone {index + 1}</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveMilestone(index)}
                    disabled={editingMilestones.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Title</label>
                    <Input
                      value={milestone.title}
                      onChange={(e) => handleMilestoneChange(index, 'title', e.target.value)}
                      placeholder="Milestone title"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      value={milestone.description}
                      onChange={(e) => handleMilestoneChange(index, 'description', e.target.value)}
                      placeholder="Milestone description"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Due Date</label>
                    <Input
                      type="date"
                      value={milestone.dueDate}
                      onChange={(e) => handleMilestoneChange(index, 'dueDate', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Amount ($)</label>
                    <Input
                      type="number"
                      value={milestone.amount}
                      onChange={(e) => handleMilestoneChange(index, 'amount', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              </Card>
            ))}
            <Button
              onClick={handleAddNewMilestone}
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Milestone
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveMilestones}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={showFundDialog} onOpenChange={setShowFundDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between text-xl">
              <span>Fund Milestone via UPI</span>
              <img 
                src="https://razorpay.com/assets/razorpay-glyph.svg" 
                alt="Razorpay" 
                className="h-6 w-6"
              />
            </DialogTitle>
            <DialogDescription className="text-sm">
              {currentFundingMilestoneIndex !== null && jobProgress?.milestones[currentFundingMilestoneIndex] && (
                <>
                  Enter your UPI details to fund the escrow for milestone: 
                  <span className="font-medium"> {jobProgress.milestones[currentFundingMilestoneIndex].title}</span>
                  <div className="mt-1">
                    Amount: <span className="font-medium">₹{jobProgress.milestones[currentFundingMilestoneIndex].amount}</span>
                  </div>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-3 py-3">
            <div className="space-y-1">
              <Label htmlFor="payerName" className="text-sm">Your Name</Label>
              <Input
                id="payerName"
                placeholder="John Doe"
                value={paymentForm.payerName}
                onChange={(e) => handlePaymentFormChange('payerName', e.target.value)}
                className="h-9"
              />
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="upiId" className="text-sm">UPI ID</Label>
              <div className="flex items-center border rounded-md focus-within:ring-1 focus-within:ring-ring overflow-hidden">
                <div className="bg-gray-50 p-2 flex items-center justify-center border-r">
                  <img 
                    src="https://cdn.razorpay.com/logos/UPI_b@2x.png" 
                    alt="UPI Logo" 
                    className="h-4 w-4"
                  />
                </div>
                <Input
                  id="upiId"
                  placeholder="yourname@upi"
                  value={paymentForm.upiId}
                  onChange={(e) => handlePaymentFormChange('upiId', e.target.value)}
                  className="border-0 shadow-none focus-visible:ring-0 h-9"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Enter your UPI ID in the format: username@upi (e.g., johndoe@okicici)
              </p>
            </div>
            
            <div className="mt-2 border-t pt-3">
              <div className="flex items-center justify-between">
                <img 
                  src="https://razorpay.com/assets/razorpay-logo.svg" 
                  alt="Powered by Razorpay" 
                  className="h-5"
                />
                <div className="flex items-center space-x-1">
                  <Lock className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-green-600 font-medium">Secure Payment</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Your UPI transaction is protected and secured by Razorpay Payment Gateway.
              </p>
            </div>
          </div>
          
          <DialogFooter className="flex-col sm:flex-col gap-2">
            <Button
              onClick={handleProcessPayment} 
              disabled={paymentProcessing}
              className="bg-blue-600 hover:bg-blue-700 w-full"
            >
              {paymentProcessing ? (
                <>
                  <div className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Processing...
                </>
              ) : (
                <>
                  {currentFundingMilestoneIndex !== null && jobProgress?.milestones[currentFundingMilestoneIndex] && (
                    <>Pay ₹{jobProgress.milestones[currentFundingMilestoneIndex].amount} via UPI</>
                  )}
                </>
              )}
            </Button>
            <Button variant="outline" onClick={() => setShowFundDialog(false)} className="w-full">
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Submit Work Dialog */}
      <Dialog open={showSubmitWorkDialog} onOpenChange={setShowSubmitWorkDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Submit Work for Review</DialogTitle>
            <DialogDescription>
              Provide a URL to your completed work (e.g. GitHub, Google Drive, Dropbox, etc.)
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="submissionUrl">Submission URL</Label>
              <Input
                id="submissionUrl"
                placeholder="https://..."
                value={workSubmissionUrl}
                onChange={(e) => setWorkSubmissionUrl(e.target.value)}
              />
            </div>
            <p className="text-sm text-gray-500">
              Make sure your work is accessible to the employer. Consider using a shared folder or repository.
            </p>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubmitWorkDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleWorkSubmission} 
              disabled={!workSubmissionUrl}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Submit for Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}; 