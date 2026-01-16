#!/bin/bash

# QuickBid Code Cleanup Script
echo "🧹 QUICKBID CODE CLEANUP & DEAD CODE REMOVAL"
echo "=============================================="

echo ""
echo "📋 ANALYZING CODEBASE FOR UNUSED COMPONENTS"
echo "=========================================="

# Create cleanup report file
report_file="cleanup-report-$(date +%Y%m%d-%H%M%S).txt"
echo "QuickBid Code Cleanup Report - $(date)" > "$report_file"
echo "=========================================" >> "$report_file"
echo "" >> "$report_file"

# Function to check if component is imported
check_imports() {
    local component_name="$1"
    local file_path="$2"
    
    # Get component name without extension
    local base_name=$(basename "$file_path" .tsx)
    local base_name_js=$(basename "$file_path" .js)
    
    echo "🔍 Checking imports for: $base_name"
    
    # Search for imports of this component across the codebase
    local import_count=$(grep -r "from.*['\"].*${base_name}['\"]" src/ 2>/dev/null | grep -v "$file_path" | wc -l)
    local import_count_js=$(grep -r "from.*['\"].*${base_name_js}['\"]" src/ 2>/dev/null | grep -v "$file_path" | wc -l)
    
    # Also check for direct imports
    local direct_import=$(grep -r "import.*${base_name}" src/ 2>/dev/null | grep -v "$file_path" | wc -l)
    local direct_import_js=$(grep -r "import.*${base_name_js}" src/ 2>/dev/null | grep -v "$file_path" | wc -l)
    
    local total_imports=$((import_count + import_count_js + direct_import + direct_import_js))
    
    if [ $total_imports -eq 0 ]; then
        echo "❌ UNUSED: $base_name (0 imports found)"
        echo "UNUSED: $file_path" >> "$report_file"
        return 1
    else
        echo "✅ USED: $base_name ($total_imports imports found)"
        echo "USED: $file_path ($total_imports imports)" >> "$report_file"
        return 0
    fi
}

# Function to check for dead code patterns
check_dead_code() {
    echo ""
    echo "💀 CHECKING FOR DEAD CODE PATTERNS"
    echo "================================="
    
    # Check for commented out code blocks
    echo "🔍 Checking for commented out code blocks..."
    local commented_blocks=$(find src/ -name "*.tsx" -o -name "*.ts" -o -name "*.js" -o -name "*.jsx" | xargs grep -l "// TODO\|// FIXME\|// XXX\|// HACK" | wc -l)
    echo "Found $commented_blocks files with TODO/FIXME comments"
    
    # Check for unused imports
    echo "🔍 Checking for unused imports..."
    local unused_imports=$(find src/ -name "*.tsx" -o -name "*.ts" | xargs grep -l "import.*from.*['\"].*['\"]" | wc -l)
    echo "Found $unused_imports files with imports"
    
    # Check for console.log statements
    echo "🔍 Checking for console.log statements..."
    local console_logs=$(find src/ -name "*.tsx" -o -name "*.ts" -o -name "*.js" -o -name "*.jsx" | xargs grep -l "console\.log" | wc -l)
    echo "Found $console_logs files with console.log statements"
    
    # Check for debugger statements
    echo "🔍 Checking for debugger statements..."
    local debuggers=$(find src/ -name "*.tsx" -o -name "*.ts" -o -name "*.js" -o -name "*.jsx" | xargs grep -l "debugger" | wc -l)
    echo "Found $debuggers files with debugger statements"
    
    echo "" >> "$report_file"
    echo "DEAD CODE ANALYSIS:" >> "$report_file"
    echo "===================" >> "$report_file"
    echo "Files with TODO/FIXME: $commented_blocks" >> "$report_file"
    echo "Files with imports: $unused_imports" >> "$report_file"
    echo "Files with console.log: $console_logs" >> "$report_file"
    echo "Files with debugger: $debuggers" >> "$report_file"
}

# Function to analyze component usage
analyze_components() {
    echo ""
    echo "📦 ANALYZING COMPONENT FILES"
    echo "==========================="
    
    local unused_count=0
    local used_count=0
    
    # Find all component files
    find src/ -name "*.tsx" -o -name "*.jsx" | while read -r file; do
        # Skip certain directories
        if [[ "$file" == *node_modules* ]] || [[ "$file" == *dist* ]] || [[ "$file" == *build* ]]; then
            continue
        fi
        
        # Skip test files
        if [[ "$file" == *.test.* ]] || [[ "$file" == *.spec.* ]]; then
            continue
        fi
        
        # Check if it's a component file (starts with uppercase)
        local filename=$(basename "$file")
        if [[ "$filename" =~ ^[A-Z] ]]; then
            if check_imports "$filename" "$file"; then
                ((used_count++))
            else
                ((unused_count++))
            fi
        fi
    done
    
    echo "" >> "$report_file"
    echo "COMPONENT ANALYSIS SUMMARY:" >> "$report_file"
    echo "=========================" >> "$report_file"
    echo "Used components: $used_count" >> "$report_file"
    echo "Unused components: $unused_count" >> "$report_file"
}

# Function to check for duplicate files
check_duplicates() {
    echo ""
    echo "🔄 CHECKING FOR DUPLICATE FILES"
    echo "=============================="
    
    # Check for files with similar names
    find src/ -name "*.tsx" -o -name "*.ts" | sed 's/\.[^.]*$//' | sort | uniq -d | while read -r dup; do
        echo "⚠️  Potential duplicate: $dup"
        find src/ -name "${dup}.*" | while read -r file; do
            echo "  - $file"
        done
        echo "Potential duplicate: $dup" >> "$report_file"
        find src/ -name "${dup}.*" | while read -r file; do
            echo "  - $file" >> "$report_file"
        done
    done
}

# Function to check for large files
check_large_files() {
    echo ""
    echo "📏 CHECKING FOR LARGE FILES"
    echo "=========================="
    
    find src/ -name "*.tsx" -o -name "*.ts" -o -name "*.js" -o -name "*.jsx" -exec wc -l {} + | sort -nr | head -10 | while read -r line_count file; do
        if [ "$line_count" -gt 500 ]; then
            echo "⚠️  Large file: $file ($line_count lines)"
            echo "Large file: $file ($line_count lines)" >> "$report_file"
        fi
    done
}

# Function to suggest cleanup actions
suggest_cleanup() {
    echo ""
    echo "💡 CLEANUP RECOMMENDATIONS"
    echo "========================="
    
    echo "" >> "$report_file"
    echo "CLEANUP RECOMMENDATIONS:" >> "$report_file"
    echo "========================" >> "$report_file"
    
    echo "1. Remove unused components and imports"
    echo "2. Clean up console.log statements (keep only for debugging)"
    echo "3. Remove debugger statements"
    echo "4. Address TODO/FIXME comments"
    echo "5. Consider splitting large files (>500 lines)"
    echo "6. Remove duplicate or redundant files"
    echo "7. Clean up unused dependencies in package.json"
    
    echo "1. Remove unused components and imports" >> "$report_file"
    echo "2. Clean up console.log statements (keep only for debugging)" >> "$report_file"
    echo "3. Remove debugger statements" >> "$report_file"
    echo "4. Address TODO/FIXME comments" >> "$report_file"
    echo "5. Consider splitting large files (>500 lines)" >> "$report_file"
    echo "6. Remove duplicate or redundant files" >> "$report_file"
    echo "7. Clean up unused dependencies in package.json" >> "$report_file"
}

# Main execution
echo "Starting code cleanup analysis..."
echo ""

# Run all analysis functions
analyze_components
check_dead_code
check_duplicates
check_large_files
suggest_cleanup

echo ""
echo "=============================================="
echo "🎯 CODE CLEANUP ANALYSIS COMPLETE"
echo "=============================================="
echo ""
echo "📊 Summary:"
echo "- Component usage analysis completed"
echo "- Dead code patterns identified"
echo "- Duplicate files checked"
echo "- Large files identified"
echo "- Cleanup recommendations provided"
echo ""
echo "📄 Detailed report saved to: $report_file"
echo ""
echo "🚀 Next Steps:"
echo "1. Review the cleanup report"
echo "2. Remove unused components safely"
echo "3. Clean up dead code patterns"
echo "4. Test after cleanup"
echo "5. Commit changes incrementally"
