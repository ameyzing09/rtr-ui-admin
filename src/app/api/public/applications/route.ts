import { NextRequest, NextResponse } from 'next/server';
import { publicApplicationService, PublicApiError } from '@/domain/public/service';
import {
  publicApplicationSubmitRequestSchema,
  type PublicApplicationSubmitRequest,
} from '@/domain/public/schemas';
import { ZodError } from 'zod';

/**
 * D3: Public Application Submit
 * POST /api/public/applications
 *
 * Route Handler for public application submission
 * Proxies request to backend API with proper error handling
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate request body
    let validatedPayload: PublicApplicationSubmitRequest;
    try {
      validatedPayload = publicApplicationSubmitRequestSchema.parse(body);
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json(
          {
            statusCode: 400,
            message: error.errors.map((err) => `${err.path.join('.')}: ${err.message}`),
            error: 'Bad Request',
          },
          { status: 400 }
        );
      }
      throw error;
    }

    // Submit application to backend
    const result = await publicApplicationService.submitApplication(validatedPayload);

    // Return success response
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Public application submission error:', error);

    if (error instanceof PublicApiError) {
      // Return error from backend
      return NextResponse.json(
        {
          statusCode: error.statusCode,
          message: error.message,
          error: error.code || 'Error',
        },
        { status: error.statusCode }
      );
    }

    // Generic error
    return NextResponse.json(
      {
        statusCode: 500,
        message: 'An unexpected error occurred',
        error: 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}

// Disable body size limit for file uploads
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};
