# FindYourMythos

## AI-Powered Personal Values Analysis Tool

FindYourMythos is a Python application that analyzes user responses to discover and map core personal values, identifying patterns, contradictions, and providing comprehensive insights.

## Features

- **Values Identification**: Automatically identifies personal values from user responses
- **Contradiction Detection**: Detects tensions between opposing values
- **Comprehensive Analysis**: Generates detailed reports with executive summaries
- **Extended Analytics**: Provides in-depth analytic notes about value patterns
- **Report Generation**: Creates formatted reports with appendices

## Installation

1. Clone this repository or navigate to the FindYourMythos directory
2. Ensure you have Python 3.7+ installed
3. No external dependencies required (uses only Python standard library)

## Usage

### Basic Usage

Run the main script with sample data:

```bash
python main.py
```

This will process sample data and generate a report showing identified values, contradictions, and analytic notes.

### Using as a Library

```python
from main import FindYourMythos

# Create analyzer instance
analyzer = FindYourMythos()

# Prepare your data
data = {
    'responses': {
        'q1': 'Your response about values here...',
        'q2': 'Another response...',
        # ... more responses
    }
}

# Process data and generate report
report = analyzer.process_data(data)
print(report)

# Save report to file
filename = analyzer.save_report()
print(f"Report saved to: {filename}")
```

## Report Structure

Generated reports include:

1. **Executive Summary**: Overview of analysis results
   - Total values identified
   - Total responses analyzed
   - Number of contradictions detected

2. **Top Identified Values**: Most prominent values with statistics
   - Value name
   - Prominence percentage
   - Mention count

3. **Value Tensions & Contradictions**: Areas of potential internal conflict
   - Description of tension
   - Severity level
   - Frequency data

4. **Appendix**: Extended analytic notes
   - Primary value analysis
   - Value diversity assessment
   - Coherence evaluation
   - Dominant themes identification

## Appendix Structure (Per User Requirements)

Based on the chat log analysis, the appendix now contains **ONLY**:

### C. Extended Analytic Notes

This section provides:
- Primary value identification and analysis
- Value diversity assessment
- Contradiction/coherence evaluation
- Dominant theme identification

**Note**: Sections A (Question-Value Mapping Table) and B (Comprehensive Value Index) have been removed per user feedback to streamline the output.

## Key Functions

### `detect_contradictions()`
Identifies tensions between opposing values in the user's profile:
- Freedom vs. Stability
- Adventure vs. Stability  
- Achievement vs. Compassion

### `generate_appendix()`
Creates the appendix section with only "C. Extended Analytic Notes" as specified in requirements.

### `process_data(data)`
Main processing function that:
1. Loads and analyzes user data
2. Detects contradictions
3. Generates comprehensive report

## Value Categories

The tool recognizes values across four main categories:

1. **Relational**: family, community, compassion
2. **Personal Growth**: growth, achievement, creativity
3. **Autonomy**: freedom, adventure, independence
4. **Security**: stability, honesty, integrity

## Data Format

Input data should follow this structure:

```python
{
    'responses': {
        'question_id': 'response text',
        'question_id_2': 'response text',
        # ...
    }
}
```

## Output

- **Console**: Prints formatted report to stdout
- **File**: Saves report with timestamp (e.g., `findyourmythos_report_20260320_143022.txt`)

## Privacy & Security

- All processing is done locally
- No data is sent to external services
- Reports are saved locally only
- Repository should be kept private for sensitive personal data

## Git Repository Setup

This project is part of the Red-Running-Horse/marina repository. To work with it:

```bash
# Check remote
git remote -v

# Should show:
# origin  https://github.com/Red-Running-Horse/marina (fetch)
# origin  https://github.com/Red-Running-Horse/marina (push)

# Make changes and commit
git add FindYourMythos/
git commit -m "Your commit message"
git push origin main
```

## Development History

This project was developed based on a detailed chat log where:
- Initial version had three appendix sections (A, B, C)
- Section A (Question-Value Mapping Table) was removed
- Section B (Comprehensive Value Index) was removed
- Final version contains only Section C (Extended Analytic Notes)
- Git/GitHub integration was set up with proper authentication

## Future Enhancements

Potential improvements:
- Machine learning for more accurate value identification
- Natural language processing for sentiment analysis
- Web interface for easier data input
- Export to multiple formats (PDF, JSON, Markdown)
- Multi-language support
- Integration with survey platforms

## Contributing

This is a private project. For questions or issues, contact the repository owner.

## License

Private - All rights reserved

## Author

Developed for personal values analysis and self-discovery.

---

**Note**: This tool is designed for self-reflection and personal growth. Results should be interpreted as insights for discussion, not absolute determinations of character or values.
