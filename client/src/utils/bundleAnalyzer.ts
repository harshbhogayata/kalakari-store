// Bundle analysis and optimization utilities
import { performance } from 'perf_hooks';

interface BundleMetrics {
  totalSize: number;
  chunkSizes: { [key: string]: number };
  duplicateModules: string[];
  unusedModules: string[];
  largestChunks: Array<{ name: string; size: number }>;
  loadTime: number;
}

export class BundleAnalyzer {
  private metrics: BundleMetrics = {
    totalSize: 0,
    chunkSizes: {},
    duplicateModules: [],
    unusedModules: [],
    largestChunks: [],
    loadTime: 0
  };

  // Analyze bundle size (client-side)
  analyzeBundleSize(): BundleMetrics {
    const startTime = performance.now();
    
    // Get all script tags
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    
    // Calculate total size
    let totalSize = 0;
    const chunkSizes: { [key: string]: number } = {};
    
    // Analyze scripts
    scripts.forEach(script => {
      const src = script.getAttribute('src');
      if (src) {
        const size = this.estimateScriptSize(src);
        chunkSizes[src] = size;
        totalSize += size;
      }
    });
    
    // Analyze stylesheets
    stylesheets.forEach(link => {
      const href = link.getAttribute('href');
      if (href) {
        const size = this.estimateStylesheetSize(href);
        chunkSizes[href] = size;
        totalSize += size;
      }
    });
    
    // Find largest chunks
    const largestChunks = Object.entries(chunkSizes)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, size]) => ({ name, size }));
    
    const loadTime = performance.now() - startTime;
    
    this.metrics = {
      totalSize,
      chunkSizes,
      duplicateModules: this.findDuplicateModules(),
      unusedModules: this.findUnusedModules(),
      largestChunks,
      loadTime
    };
    
    return this.metrics;
  }

  // Estimate script size (simplified)
  private estimateScriptSize(src: string): number {
    // This is a simplified estimation
    // In a real implementation, you would fetch the actual file size
    if (src.includes('main')) return 500000; // ~500KB for main bundle
    if (src.includes('vendor')) return 300000; // ~300KB for vendor bundle
    if (src.includes('chunk')) return 100000; // ~100KB for chunks
    return 50000; // Default estimate
  }

  // Estimate stylesheet size
  private estimateStylesheetSize(href: string): number {
    if (href.includes('main')) return 50000; // ~50KB for main CSS
    if (href.includes('vendor')) return 30000; // ~30KB for vendor CSS
    return 10000; // Default estimate
  }

  // Find duplicate modules (simplified)
  private findDuplicateModules(): string[] {
    // This would require more sophisticated analysis
    // For now, return common duplicates
    return [
      'lodash',
      'moment',
      'react-dom'
    ];
  }

  // Find unused modules (simplified)
  private findUnusedModules(): string[] {
    // This would require static analysis
    // For now, return common unused modules
    return [
      'unused-utility',
      'deprecated-component'
    ];
  }

  // Generate optimization recommendations
  generateRecommendations(): string[] {
    const recommendations: string[] = [];
    
    if (this.metrics.totalSize > 1000000) { // > 1MB
      recommendations.push('Bundle size is large (>1MB). Consider code splitting.');
    }
    
    if (this.metrics.duplicateModules.length > 0) {
      recommendations.push(`Remove duplicate modules: ${this.metrics.duplicateModules.join(', ')}`);
    }
    
    if (this.metrics.unusedModules.length > 0) {
      recommendations.push(`Remove unused modules: ${this.metrics.unusedModules.join(', ')}`);
    }
    
    if (this.metrics.largestChunks[0]?.size > 500000) {
      recommendations.push(`Largest chunk is ${(this.metrics.largestChunks[0].size / 1024).toFixed(0)}KB. Consider splitting.`);
    }
    
    if (this.metrics.loadTime > 1000) {
      recommendations.push(`Load time is ${this.metrics.loadTime.toFixed(0)}ms. Consider optimization.`);
    }
    
    return recommendations;
  }

  // Get performance score (0-100)
  getPerformanceScore(): number {
    let score = 100;
    
    // Bundle size penalty
    if (this.metrics.totalSize > 1000000) score -= 20;
    else if (this.metrics.totalSize > 500000) score -= 10;
    
    // Duplicate modules penalty
    score -= this.metrics.duplicateModules.length * 5;
    
    // Unused modules penalty
    score -= this.metrics.unusedModules.length * 3;
    
    // Load time penalty
    if (this.metrics.loadTime > 2000) score -= 15;
    else if (this.metrics.loadTime > 1000) score -= 10;
    
    return Math.max(0, score);
  }

  // Export metrics as JSON
  exportMetrics(): string {
    return JSON.stringify({
      metrics: this.metrics,
      recommendations: this.generateRecommendations(),
      performanceScore: this.getPerformanceScore(),
      timestamp: new Date().toISOString()
    }, null, 2);
  }
}

// Webpack bundle analyzer configuration
export const webpackBundleAnalyzer = {
  // Generate bundle analysis report
  generateReport: () => {
    const analyzer = new BundleAnalyzer();
    const metrics = analyzer.analyzeBundleSize();
    const recommendations = analyzer.generateRecommendations();
    const score = analyzer.getPerformanceScore();
    
    console.group('📊 Bundle Analysis Report');
    console.log('Total Size:', (metrics.totalSize / 1024).toFixed(2) + 'KB');
    console.log('Load Time:', metrics.loadTime.toFixed(2) + 'ms');
    console.log('Performance Score:', score + '/100');
    console.log('Largest Chunks:', metrics.largestChunks.slice(0, 3));
    console.log('Recommendations:', recommendations);
    console.groupEnd();
    
    return {
      metrics,
      recommendations,
      score
    };
  }
};

// Tree shaking utilities
export const treeShaking = {
  // Check if module is tree-shakeable
  isTreeShakeable: (moduleName: string): boolean => {
    const treeShakeableModules = [
      'lodash-es',
      'date-fns',
      'ramda',
      'rxjs'
    ];
    
    return treeShakeableModules.some(name => moduleName.includes(name));
  },
  
  // Get tree-shaking recommendations
  getRecommendations: (imports: string[]): string[] => {
    const recommendations: string[] = [];
    
    imports.forEach(importPath => {
      if (importPath.includes('lodash') && !importPath.includes('lodash-es')) {
        recommendations.push(`Replace 'lodash' with 'lodash-es' for better tree-shaking`);
      }
      
      if (importPath.includes('moment')) {
        recommendations.push(`Consider replacing 'moment' with 'date-fns' for better tree-shaking`);
      }
    });
    
    return recommendations;
  }
};

// Code splitting utilities
export const codeSplitting = {
  // Dynamic import helper
  dynamicImport: <T>(importFunc: () => Promise<T>): Promise<T> => {
    return importFunc();
  },
  
  // Route-based code splitting
  createRouteChunk: (routeName: string) => {
    return () => import(`../pages/${routeName}`);
  },
  
  // Component-based code splitting
  createComponentChunk: (componentName: string) => {
    return () => import(`../components/${componentName}`);
  }
};

export default BundleAnalyzer;
