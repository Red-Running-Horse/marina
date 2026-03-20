"""
FindYourMythos - AI-Powered Personal Values Analysis Tool

This application analyzes user responses to discover and map their core personal values,
identifying patterns, contradictions, and providing comprehensive insights.
"""

import json
from typing import Dict, List, Any, Tuple
from datetime import datetime


class FindYourMythos:
    """Main class for the FindYourMythos application."""
    
    def __init__(self):
        self.user_data = {}
        self.values_mapping = {}
        self.contradictions = []
        self.analysis_notes = []
    
    def load_data(self, data: Dict[str, Any]) -> None:
        """
        Load user submitted data for analysis.
        
        Args:
            data: Dictionary containing user responses and values
        """
        self.user_data = data
        self.values_mapping = self._extract_values_mapping(data)
    
    def _extract_values_mapping(self, data: Dict[str, Any]) -> Dict[str, List[str]]:
        """
        Extract and map values from user data.
        
        Args:
            data: User submitted data
            
        Returns:
            Dictionary mapping questions to identified values
        """
        mapping = {}
        
        # Extract values from responses
        if 'responses' in data:
            for question_id, response in data['responses'].items():
                identified_values = self._identify_values_in_response(response)
                if identified_values:
                    mapping[question_id] = identified_values
        
        return mapping
    
    def _identify_values_in_response(self, response: str) -> List[str]:
        """
        Identify personal values mentioned in a response.
        
        Args:
            response: User's response text
            
        Returns:
            List of identified values
        """
        # Common personal values keywords
        value_keywords = {
            'family': ['family', 'relatives', 'parents', 'children'],
            'freedom': ['freedom', 'independence', 'autonomy', 'liberty'],
            'honesty': ['honesty', 'truth', 'integrity', 'authentic'],
            'creativity': ['creativity', 'innovation', 'imagination', 'artistic'],
            'achievement': ['achievement', 'success', 'accomplish', 'goals'],
            'compassion': ['compassion', 'empathy', 'kindness', 'caring'],
            'growth': ['growth', 'learning', 'development', 'improvement'],
            'adventure': ['adventure', 'excitement', 'exploration', 'risk'],
            'stability': ['stability', 'security', 'certainty', 'predictable'],
            'community': ['community', 'belonging', 'social', 'connection'],
        }
        
        identified = []
        response_lower = response.lower()
        
        for value, keywords in value_keywords.items():
            if any(keyword in response_lower for keyword in keywords):
                identified.append(value)
        
        return identified
    
    def detect_contradictions(self) -> List[Dict[str, Any]]:
        """
        Detect contradictions in user's stated values.
        
        Returns:
            List of detected contradictions with details
        """
        contradictions = []
        
        # Check for opposing values
        opposing_pairs = [
            ('freedom', 'stability'),
            ('adventure', 'stability'),
            ('achievement', 'compassion'),
        ]
        
        all_values = []
        for values_list in self.values_mapping.values():
            all_values.extend(values_list)
        
        value_counts = {}
        for value in all_values:
            value_counts[value] = value_counts.get(value, 0) + 1
        
        for value1, value2 in opposing_pairs:
            if value1 in value_counts and value2 in value_counts:
                contradictions.append({
                    'type': 'opposing_values',
                    'values': [value1, value2],
                    'description': f"Tension detected between '{value1}' and '{value2}'",
                    'severity': 'moderate',
                    'frequency': {
                        value1: value_counts[value1],
                        value2: value_counts[value2]
                    }
                })
        
        self.contradictions = contradictions
        return contradictions
    
    def generate_comprehensive_index(self) -> Dict[str, Any]:
        """
        Generate a comprehensive index of all identified values.
        
        Returns:
            Dictionary containing value index with statistics
        """
        value_index = {}
        
        for question_id, values in self.values_mapping.items():
            for value in values:
                if value not in value_index:
                    value_index[value] = {
                        'count': 0,
                        'questions': [],
                        'prominence': 0
                    }
                value_index[value]['count'] += 1
                value_index[value]['questions'].append(question_id)
        
        # Calculate prominence (percentage of responses mentioning this value)
        total_questions = len(self.values_mapping)
        for value, data in value_index.items():
            if total_questions > 0:
                data['prominence'] = (len(data['questions']) / total_questions) * 100
        
        return value_index
    
    def generate_analytic_notes(self) -> List[str]:
        """
        Generate extended analytic notes about the user's values profile.
        
        Returns:
            List of analytic note strings
        """
        notes = []
        
        # Analyze value distribution
        value_index = self.generate_comprehensive_index()
        
        if value_index:
            # Most prominent value
            top_value = max(value_index.items(), key=lambda x: x[1]['prominence'])
            notes.append(
                f"Primary Value: '{top_value[0].capitalize()}' appears most frequently, "
                f"mentioned in {top_value[1]['prominence']:.1f}% of responses, "
                f"suggesting this is a core driving force."
            )
            
            # Value diversity
            num_unique_values = len(value_index)
            notes.append(
                f"Value Diversity: {num_unique_values} distinct values identified, "
                f"indicating a {'rich and complex' if num_unique_values > 5 else 'focused'} "
                f"value system."
            )
            
            # Contradictions
            if self.contradictions:
                notes.append(
                    f"Value Tensions: {len(self.contradictions)} potential contradictions detected, "
                    f"suggesting areas for deeper self-reflection and potential growth."
                )
            else:
                notes.append(
                    "Value Coherence: No major contradictions detected, "
                    "indicating a well-integrated value system."
                )
            
            # Patterns
            value_categories = {
                'relational': ['family', 'community', 'compassion'],
                'personal_growth': ['growth', 'achievement', 'creativity'],
                'autonomy': ['freedom', 'adventure', 'independence'],
                'security': ['stability', 'honesty', 'integrity']
            }
            
            dominant_categories = []
            for category, category_values in value_categories.items():
                category_count = sum(
                    1 for v in value_index.keys() 
                    if v in category_values
                )
                if category_count >= 2:
                    dominant_categories.append(category)
            
            if dominant_categories:
                notes.append(
                    f"Dominant Themes: Strong emphasis on {', '.join(dominant_categories)} values, "
                    f"revealing key life priorities."
                )
        
        self.analysis_notes = notes
        return notes
    
    def generate_appendix(self) -> str:
        """
        Generate the appendix section for the report.
        
        Based on user feedback, only includes Section C: Extended Analytic Notes.
        Sections A (Question-Value Mapping) and B (Comprehensive Value Index) 
        have been removed per user request.
        
        Returns:
            Formatted appendix string
        """
        appendix = []
        appendix.append("=" * 70)
        appendix.append("APPENDIX")
        appendix.append("=" * 70)
        appendix.append("")
        
        # Section C: Extended Analytic Notes (ONLY section per user requirements)
        appendix.append("C. Extended Analytic Notes")
        appendix.append("-" * 70)
        appendix.append("")
        
        notes = self.generate_analytic_notes()
        if notes:
            for i, note in enumerate(notes, 1):
                appendix.append(f"{i}. {note}")
                appendix.append("")
        else:
            appendix.append("No analytic notes available. Process data to generate insights.")
            appendix.append("")
        
        appendix.append("=" * 70)
        
        return "\n".join(appendix)
    
    def generate_report(self) -> str:
        """
        Generate a complete FindYourMythos report.
        
        Returns:
            Formatted report string
        """
        report = []
        
        # Header
        report.append("=" * 70)
        report.append("FINDYOURMYTHOS REPORT")
        report.append("Personal Values Analysis")
        report.append("=" * 70)
        report.append(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        report.append("")
        
        # Summary
        report.append("EXECUTIVE SUMMARY")
        report.append("-" * 70)
        value_index = self.generate_comprehensive_index()
        report.append(f"Total Values Identified: {len(value_index)}")
        report.append(f"Total Responses Analyzed: {len(self.values_mapping)}")
        report.append(f"Contradictions Detected: {len(self.contradictions)}")
        report.append("")
        
        # Core Values
        if value_index:
            report.append("TOP IDENTIFIED VALUES")
            report.append("-" * 70)
            sorted_values = sorted(
                value_index.items(), 
                key=lambda x: x[1]['prominence'], 
                reverse=True
            )
            for value, data in sorted_values[:5]:
                report.append(
                    f"• {value.capitalize()}: {data['prominence']:.1f}% prominence "
                    f"({data['count']} mentions)"
                )
            report.append("")
        
        # Contradictions
        if self.contradictions:
            report.append("VALUE TENSIONS & CONTRADICTIONS")
            report.append("-" * 70)
            for i, contradiction in enumerate(self.contradictions, 1):
                report.append(f"{i}. {contradiction['description']}")
                report.append(f"   Severity: {contradiction['severity'].upper()}")
                report.append("")
        
        # Append the appendix
        report.append("")
        report.append(self.generate_appendix())
        
        return "\n".join(report)
    
    def process_data(self, data: Dict[str, Any]) -> str:
        """
        Process submitted data and generate a new report.
        
        Args:
            data: User submitted data
            
        Returns:
            Generated report string
        """
        self.load_data(data)
        self.detect_contradictions()
        return self.generate_report()
    
    def save_report(self, filename: str = None) -> str:
        """
        Save the generated report to a file.
        
        Args:
            filename: Optional filename (defaults to timestamped file)
            
        Returns:
            The filename where report was saved
        """
        if filename is None:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"findyourmythos_report_{timestamp}.txt"
        
        report = self.generate_report()
        
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(report)
        
        return filename


def main():
    """Main entry point for the FindYourMythos application."""
    
    # Example usage
    print("FindYourMythos - Personal Values Analysis Tool")
    print("=" * 70)
    print()
    
    # Sample data
    sample_data = {
        'responses': {
            'q1': 'I value spending time with my family and building strong relationships.',
            'q2': 'Freedom and independence are very important to me.',
            'q3': 'I strive for personal growth and continuous learning.',
            'q4': 'Being creative and expressing myself artistically brings me joy.',
            'q5': 'I need stability and security in my life.',
            'q6': 'Honesty and integrity are the foundation of who I am.',
            'q7': 'I love adventure and trying new experiences.',
            'q8': 'Achieving my goals and being successful matters to me.',
        }
    }
    
    # Create analyzer
    analyzer = FindYourMythos()
    
    # Process data and generate report
    print("Processing sample data...")
    report = analyzer.process_data(sample_data)
    
    print()
    print(report)
    print()
    
    # Save report
    filename = analyzer.save_report()
    print(f"Report saved to: {filename}")


if __name__ == "__main__":
    main()
